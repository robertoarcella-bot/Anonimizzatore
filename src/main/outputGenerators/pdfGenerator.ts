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
  origWidth: number  // original width from pdfjs
}

/**
 * Anonymize a PDF by reconstructing it from scratch.
 * No original text remains in the output file.
 */
export async function anonymizePdf(
  filePath: string,
  entities: Entity[],
  outputDir: string
): Promise<string> {
  const confirmedEntities = entities.filter(e => e.confirmed)
  if (confirmedEntities.length === 0) {
    throw new Error('Nessuna entit\u00e0 confermata da anonimizzare')
  }

  const fileBuffer = readFileSync(filePath)
  const sorted = [...confirmedEntities].sort((a, b) => b.text.length - a.text.length)

  // === Step 1: Extract text fragments ===
  const path = require('path')
  const pdfjsPath = path.resolve('node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/pdf.mjs')
  const dynamicImport = new Function('m', 'return import(m)')
  const pdfjs = await dynamicImport('file:///' + pdfjsPath.replace(/\\/g, '/'))

  if (pdfjs.GlobalWorkerOptions) {
    const workerPath = 'file:///' + path.resolve('node_modules/pdf-parse/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs').split('\\').join('/')
    pdfjs.GlobalWorkerOptions.workerSrc = workerPath
  }

  const pdfjsDoc = await pdfjs.getDocument({
    data: new Uint8Array(fileBuffer),
    useSystemFonts: true,
    useWorkerFetch: false,
    isEvalSupported: false,
    verbosity: 0
  }).promise

  const pageData: Array<{ width: number; height: number; fragments: TextFragment[] }> = []

  for (let i = 1; i <= pdfjsDoc.numPages; i++) {
    const page = await pdfjsDoc.getPage(i)
    const viewport = page.getViewport({ scale: 1.0 })
    const content = await page.getTextContent()
    const fragments: TextFragment[] = []

    for (const item of content.items as any[]) {
      if (!item.str && !item.hasEOL) continue
      const tx = item.transform || [1, 0, 0, 1, 0, 0]
      const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1])
      const fontName = (item.fontName || '').toLowerCase()

      fragments.push({
        str: item.str || '',
        x: tx[4],
        y: tx[5],
        fontSize: Math.round(fontSize * 10) / 10,
        isBold: fontName.includes('bold') || fontName.includes('black'),
        isItalic: fontName.includes('italic') || fontName.includes('oblique'),
        origWidth: item.width || 0
      })
    }

    pageData.push({ width: viewport.width, height: viewport.height, fragments })
  }

  // === Step 2: Replace entities in text fragments ===
  for (const pd of pageData) {
    const lines = groupByLine(pd.fragments)

    for (const line of lines) {
      const lineText = line.map(f => f.str).join('')

      for (const entity of sorted) {
        // Try exact match first
        replaceEntityInLine(line, lineText, entity)
        // Also try all permutations of multi-word names (e.g. "Orio Attilio Franco" matches "ATTILIO FRANCO ORIO")
        const words = entity.text.split(/\s+/)
        if (words.length >= 2 && words.length <= 4) {
          const perms = getPermutations(words)
          for (const perm of perms) {
            const permText = perm.join(' ')
            if (permText.toLowerCase() !== entity.text.toLowerCase()) {
              replaceEntityInLine(line, line.map(f => f.str).join(''), { ...entity, text: permText })
            }
          }
        }
      }
    }
  }

  // === Step 3: Build new PDF ===
  const newDoc = await PDFDocument.create()
  const fontRegular = await newDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await newDoc.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await newDoc.embedFont(StandardFonts.HelveticaOblique)
  const fontBoldItalic = await newDoc.embedFont(StandardFonts.HelveticaBoldOblique)

  for (const pd of pageData) {
    const page = newDoc.addPage([pd.width, pd.height])

    for (const frag of pd.fragments) {
      if (!frag.str) continue

      const font = pickFont(frag, fontRegular, fontBold, fontItalic, fontBoldItalic)
      const fontSize = Math.max(frag.fontSize, 4)

      // Trim trailing spaces from fragments to avoid excessive spacing
      const text = frag.str.replace(/\s+$/, ' ')
      if (!text.trim()) continue

      try {
        font.widthOfTextAtSize(text, fontSize)
        page.drawText(text, {
          x: frag.x,
          y: frag.y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        })
      } catch {
        drawTextSafe(page, frag.x, frag.y, text, font, fontRegular, fontSize)
      }
    }
  }

  // === Step 4: Save ===
  const outputFileName = `ANONIMIZZATO_${basename(filePath)}`
  const outputPath = join(outputDir, outputFileName)
  writeFileSync(outputPath, await newDoc.save())
  return outputPath
}

/**
 * Replace an entity in a line of fragments.
 * Handles the case where entity text spans multiple fragments.
 * Uses normalized (multi-space collapsed) matching.
 */
function replaceEntityInLine(
  fragments: TextFragment[],
  _lineText: string,
  entity: Entity
): void {
  // Build line text and a mapping from lineText char index -> (fragment index, local char index)
  let lineText = ''
  const charMap: Array<{ fragIdx: number; localIdx: number }> = []

  for (let fi = 0; fi < fragments.length; fi++) {
    const str = fragments[fi].str
    for (let ci = 0; ci < str.length; ci++) {
      charMap.push({ fragIdx: fi, localIdx: ci })
      lineText += str[ci]
    }
  }

  // Normalize both line text and search text: collapse multiple spaces into one
  const normalizedLine = lineText.replace(/\s+/g, ' ').toLowerCase()
  const normalizedSearch = entity.text.replace(/\s+/g, ' ').toLowerCase()

  // Build mapping from normalized index -> original index
  const normToOrig: number[] = []
  let normIdx = 0
  const normalized = lineText.replace(/\s+/g, ' ')
  let origIdx = 0
  let lineIdx = 0

  // Simpler approach: search in normalized line, then map back via character tracking
  const normChars: Array<{ origCharIdx: number }> = []
  {
    let i = 0
    while (i < lineText.length) {
      if (/\s/.test(lineText[i])) {
        normChars.push({ origCharIdx: i })
        // Skip all consecutive whitespace in original
        while (i < lineText.length && /\s/.test(lineText[i])) i++
      } else {
        normChars.push({ origCharIdx: i })
        i++
      }
    }
  }

  // Search for entity in normalized text
  const normLine = normChars.map((_, idx) => {
    const origI = normChars[idx].origCharIdx
    return lineText[origI]
  }).join('').replace(/\s+/g, ' ').toLowerCase()

  // Simple normalized search
  const fullNormLine = lineText.replace(/\s+/g, ' ').toLowerCase()
  let searchFrom = 0

  while (true) {
    const matchIdx = fullNormLine.indexOf(normalizedSearch, searchFrom)
    if (matchIdx === -1) break
    searchFrom = matchIdx + 1

    const matchEnd = matchIdx + normalizedSearch.length

    // Map normalized match positions back to original char positions
    // by walking through the original text and counting non-collapsed chars
    let normPos = 0
    let origStart = -1
    let origEnd = -1

    for (let i = 0; i < lineText.length && normPos <= matchEnd; i++) {
      if (normPos === matchIdx && origStart === -1) origStart = i
      if (normPos === matchEnd) { origEnd = i; break }

      if (/\s/.test(lineText[i])) {
        normPos++
        // Skip all consecutive whitespace
        while (i + 1 < lineText.length && /\s/.test(lineText[i + 1])) i++
      } else {
        normPos++
      }
    }
    if (origEnd === -1) origEnd = lineText.length

    if (origStart === -1 || origStart >= charMap.length) continue

    // Find covered fragment range
    const firstFrag = charMap[origStart]?.fragIdx ?? -1
    const lastFrag = charMap[Math.min(origEnd - 1, charMap.length - 1)]?.fragIdx ?? firstFrag

    if (firstFrag === -1) continue

    // Put pseudonym in first fragment, blank out the rest
    const firstLocalStart = charMap[origStart]?.localIdx ?? 0
    const frag = fragments[firstFrag]

    if (firstFrag === lastFrag) {
      // Match within a single fragment
      const lastLocalEnd = (charMap[Math.min(origEnd - 1, charMap.length - 1)]?.localIdx ?? frag.str.length - 1) + 1
      frag.str = frag.str.substring(0, firstLocalStart) + entity.pseudonym + frag.str.substring(lastLocalEnd)
    } else {
      // Match spans multiple fragments
      frag.str = frag.str.substring(0, firstLocalStart) + entity.pseudonym
      for (let fi = firstFrag + 1; fi <= lastFrag && fi < fragments.length; fi++) {
        if (fi === lastFrag) {
          const lastLocalEnd = (charMap[Math.min(origEnd - 1, charMap.length - 1)]?.localIdx ?? fragments[fi].str.length - 1) + 1
          fragments[fi].str = fragments[fi].str.substring(lastLocalEnd)
        } else {
          fragments[fi].str = ''
        }
      }
    }

    // After replacement, we must stop searching this line (text has changed)
    break
  }
}

function pickFont(frag: TextFragment, regular: PDFFont, bold: PDFFont, italic: PDFFont, boldItalic: PDFFont): PDFFont {
  if (frag.isBold && frag.isItalic) return boldItalic
  if (frag.isBold) return bold
  if (frag.isItalic) return italic
  return regular
}

function drawTextSafe(page: PDFPage, x: number, y: number, text: string, font: PDFFont, fallback: PDFFont, fontSize: number): void {
  let cx = x
  for (const ch of text) {
    try {
      font.widthOfTextAtSize(ch, fontSize)
      page.drawText(ch, { x: cx, y, size: fontSize, font, color: rgb(0, 0, 0) })
      cx += font.widthOfTextAtSize(ch, fontSize)
    } catch {
      try {
        fallback.widthOfTextAtSize(ch, fontSize)
        page.drawText(ch, { x: cx, y, size: fontSize, font: fallback, color: rgb(0, 0, 0) })
        cx += fallback.widthOfTextAtSize(ch, fontSize)
      } catch {
        cx += fontSize * 0.3
      }
    }
  }
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

/** Generate all permutations of an array (max 4 elements to avoid explosion) */
function getPermutations(arr: string[]): string[][] {
  if (arr.length <= 1) return [arr]
  if (arr.length > 4) return [arr] // safety limit
  const results: string[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const perm of getPermutations(rest)) {
      results.push([arr[i], ...perm])
    }
  }
  return results
}
