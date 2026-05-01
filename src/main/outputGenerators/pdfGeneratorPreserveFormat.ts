import { Entity } from '../../shared/types'
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib'
import { readFileSync, writeFileSync } from 'fs'
import { join, basename } from 'path'

interface TextFragment {
  str: string
  x: number
  y: number
  fontSize: number
  isBold: boolean
  isItalic: boolean
  width: number
  height: number
}

/**
 * "Preserve formatting" PDF anonymizer (opt-in mode).
 *
 * Approach: load the ORIGINAL PDF (preserves layout, fonts, images, signature
 * blocks, headers/footers, embedded objects exactly as they were), then apply
 * visual redactions on top of detected entity occurrences:
 *
 *   1. White rectangle covering the original text bounding box
 *   2. Pseudonym text drawn at the same position
 *
 * Trade-off vs. the secure rebuild:
 *   - PRO: visual fidelity is very close to the original
 *   - CON: the underlying content stream still contains the original text
 *     (a determined user could recover it via copy/paste or text extraction
 *     of the file). Visible output is anonymized; bytes-on-disk are not
 *     fully scrubbed in this mode.
 *
 * The user is warned about this trade-off in the SettingsModal before
 * enabling the feature.
 */
export async function anonymizePdfPreserveFormat(
  filePath: string,
  entities: Entity[],
  outputDir: string
): Promise<string> {
  const confirmedEntities = entities.filter(e => e.confirmed)
  if (confirmedEntities.length === 0) {
    throw new Error('Nessuna entità confermata da anonimizzare')
  }

  const fileBuffer = readFileSync(filePath)
  // Sort entities by length desc — replace longer matches first so partial
  // matches (e.g. "Mario" inside "Mario Rossi") don't fire prematurely
  const sorted = [...confirmedEntities].sort((a, b) => b.text.length - a.text.length)

  // === Step 1: Open the original PDF — preserves everything ===
  const pdfDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })

  // === Step 2: Extract text fragments + bboxes via pdfjs ===
  const path = require('path')
  const { app } = require('electron')
  const appRoot = app.isPackaged ? path.join(process.resourcesPath, 'app.asar') : path.resolve('.')
  const pdfjsPath = path.join(appRoot, 'node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/pdf.mjs')
  const workerFile = path.join(appRoot, 'node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')

  const dynamicImport = new Function('m', 'return import(m)')
  const pdfjs = await dynamicImport('file:///' + pdfjsPath.split(path.sep).join('/'))
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'file:///' + workerFile.split(path.sep).join('/')
  }

  const pdfjsDoc = await pdfjs.getDocument({
    data: new Uint8Array(fileBuffer),
    useSystemFonts: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    verbosity: 0
  }).promise

  // === Step 3: For each page, find entity occurrences and overlay redactions ===
  const pages = pdfDoc.getPages()
  const fontHelv = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontHelvBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontHelvIta = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  for (let i = 0; i < Math.min(pdfjsDoc.numPages, pages.length); i++) {
    const pdfjsPage = await pdfjsDoc.getPage(i + 1)
    const content = await pdfjsPage.getTextContent()
    const fragments: TextFragment[] = []

    for (const item of content.items as any[]) {
      if (!item.str) continue
      const tx = item.transform || [1, 0, 0, 1, 0, 0]
      const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1])
      const fontName = (item.fontName || '').toLowerCase()
      fragments.push({
        str: item.str,
        x: tx[4],
        y: tx[5],
        fontSize: Math.round(fontSize * 10) / 10,
        isBold: fontName.includes('bold') || fontName.includes('black'),
        isItalic: fontName.includes('italic') || fontName.includes('oblique'),
        width: item.width || 0,
        height: item.height || fontSize
      })
    }

    // Group fragments into lines so multi-fragment matches can be located
    const lines = groupByLine(fragments)
    const targetPage = pages[i]

    for (const line of lines) {
      if (line.length === 0) continue
      const lineText = line.map(f => f.str).join('')

      for (const entity of sorted) {
        const occurrences = findAllCaseInsensitive(lineText, entity.text)
        for (const startIdx of occurrences) {
          const endIdx = startIdx + entity.text.length
          // Map back to fragment range to compute the visual bounding box
          const range = mapRangeToFragments(line, startIdx, endIdx)
          if (!range) continue
          drawRedaction(targetPage, range, entity.pseudonym, fontHelv, fontHelvBold, fontHelvIta)
        }
      }
    }
  }

  // === Step 4: Save ===
  const outputFileName = `ANONIMIZZATO_${basename(filePath)}`
  const outputPath = join(outputDir, outputFileName)
  writeFileSync(outputPath, await pdfDoc.save())
  return outputPath
}

interface FragmentRange {
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  isBold: boolean
  isItalic: boolean
}

function mapRangeToFragments(line: TextFragment[], startIdx: number, endIdx: number): FragmentRange | null {
  let cursor = 0
  let firstFrag = -1
  let firstLocal = 0
  let lastFrag = -1
  let lastLocal = 0

  for (let i = 0; i < line.length; i++) {
    const len = line[i].str.length
    if (firstFrag === -1 && cursor + len > startIdx) {
      firstFrag = i
      firstLocal = startIdx - cursor
    }
    if (cursor + len >= endIdx) {
      lastFrag = i
      lastLocal = endIdx - cursor
      break
    }
    cursor += len
  }

  if (firstFrag === -1 || lastFrag === -1) return null

  const first = line[firstFrag]
  const last = line[lastFrag]

  // Approximate x of the start within the first fragment
  const charsBefore = firstLocal
  const totalCharsFirst = first.str.length || 1
  const startX = first.x + (first.width / totalCharsFirst) * charsBefore

  // End x within the last fragment
  const charsBeforeEnd = lastLocal
  const totalCharsLast = last.str.length || 1
  const endX = last.x + (last.width / totalCharsLast) * charsBeforeEnd

  return {
    x: startX,
    y: first.y,
    width: Math.max(endX - startX, first.fontSize * 0.5),
    height: Math.max(first.height, first.fontSize * 1.1),
    fontSize: first.fontSize,
    isBold: first.isBold,
    isItalic: first.isItalic
  }
}

function drawRedaction(
  page: PDFPage,
  range: FragmentRange,
  pseudonym: string,
  fontReg: PDFFont,
  fontBold: PDFFont,
  fontIta: PDFFont
): void {
  // White rectangle to cover the original text — small descender padding
  const pad = range.fontSize * 0.2
  page.drawRectangle({
    x: range.x - 1,
    y: range.y - pad,
    width: range.width + 2,
    height: range.height + pad * 2,
    color: rgb(1, 1, 1)
  })

  // Pick a font matching style (Helvetica family — best match for legal docs)
  const font = range.isBold ? fontBold : range.isItalic ? fontIta : fontReg

  // Shrink text size if pseudonym is wider than original bbox
  let drawSize = range.fontSize
  let textWidth = font.widthOfTextAtSize(pseudonym, drawSize)
  if (textWidth > range.width && range.width > 0) {
    drawSize = drawSize * (range.width / textWidth)
    drawSize = Math.max(drawSize, 4)
  }

  page.drawText(pseudonym, {
    x: range.x,
    y: range.y,
    size: drawSize,
    font,
    color: rgb(0, 0, 0)
  })
}

function findAllCaseInsensitive(haystack: string, needle: string): number[] {
  if (!needle) return []
  const positions: number[] = []
  const hLow = haystack.toLowerCase()
  const nLow = needle.toLowerCase()
  let from = 0
  while (true) {
    const idx = hLow.indexOf(nLow, from)
    if (idx === -1) break
    positions.push(idx)
    from = idx + nLow.length
  }
  return positions
}

function groupByLine(fragments: TextFragment[]): TextFragment[][] {
  if (fragments.length === 0) return []
  const sorted = [...fragments].sort((a, b) => {
    const dy = b.y - a.y
    if (Math.abs(dy) > 3) return dy
    return a.x - b.x
  })

  const lines: TextFragment[][] = []
  let currentLine: TextFragment[] = [sorted[0]]
  let currentY = sorted[0].y

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i]
    const threshold = Math.max(item.fontSize * 0.4, 2)
    if (Math.abs(item.y - currentY) <= threshold) {
      currentLine.push(item)
    } else {
      currentLine.sort((a, b) => a.x - b.x)
      lines.push(currentLine)
      currentLine = [item]
      currentY = item.y
    }
  }
  currentLine.sort((a, b) => a.x - b.x)
  lines.push(currentLine)
  return lines
}
