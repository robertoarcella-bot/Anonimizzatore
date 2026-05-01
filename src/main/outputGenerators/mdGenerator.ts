import { Entity } from '../../shared/types'
import { readFileSync, writeFileSync } from 'fs'
import { join, basename, extname } from 'path'
import { replaceEntitiesInText } from './textReplacer'

/**
 * Generate an anonymized Markdown version of the input document.
 * Works for PDF, DOCX and TXT inputs by extracting their text first,
 * then producing a clean .md file with header metadata + anonymized body.
 */
export async function anonymizeToMarkdown(
  filePath: string,
  entities: Entity[],
  outputDir: string
): Promise<string> {
  const confirmedEntities = entities.filter(e => e.confirmed)
  if (confirmedEntities.length === 0) {
    throw new Error('Nessuna entità confermata da anonimizzare')
  }

  const ext = extname(filePath).toLowerCase()
  const rawText = await extractText(filePath, ext)
  const anonymizedText = replaceEntitiesInText(rawText, confirmedEntities)

  const baseName = basename(filePath, ext)
  const sourceFile = basename(filePath)

  // Build markdown with a metadata header
  const md = buildMarkdown({
    sourceFile,
    anonymizedText,
    entityCount: confirmedEntities.length
  })

  const outputPath = join(outputDir, `ANONIMIZZATO_${baseName}.md`)
  writeFileSync(outputPath, md, 'utf-8')

  return outputPath
}

async function extractText(filePath: string, ext: string): Promise<string> {
  switch (ext) {
    case '.txt':
    case '.md':
      return readFileSync(filePath, 'utf-8')

    case '.docx': {
      const mammoth = await import('mammoth')
      const buffer = readFileSync(filePath)
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }

    case '.pdf': {
      const fileBuffer = readFileSync(filePath)
      const { PDFParse } = require('pdf-parse')
      const parser = new PDFParse({ data: fileBuffer })
      await parser.load()
      const textResult = await parser.getText()
      return textResult.text || ''
    }

    default:
      throw new Error(`Formato non supportato per export Markdown: ${ext}`)
  }
}

interface MdInput {
  sourceFile: string
  anonymizedText: string
  entityCount: number
}

function buildMarkdown({ sourceFile, anonymizedText, entityCount }: MdInput): string {
  const today = new Date().toISOString().substring(0, 10)
  const lines: string[] = []

  // Header (frontmatter-like metadata block)
  lines.push(`# Documento anonimizzato`)
  lines.push('')
  lines.push(`> **File originale**: ${sourceFile}  `)
  lines.push(`> **Data anonimizzazione**: ${today}  `)
  lines.push(`> **Entità sostituite**: ${entityCount}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  // Body: improve readability by detecting paragraph boundaries
  // Split on double newlines to preserve paragraphs, then collapse internal whitespace
  const paragraphs = anonymizedText
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n+/)
    .map(p => p.replace(/[ \t]+/g, ' ').replace(/\n[ \t]+/g, '\n').trim())
    .filter(p => p.length > 0)

  for (const paragraph of paragraphs) {
    // Heuristic: lines that look like headings (short, all caps or end with colon)
    // get rendered as bold instead of plain paragraphs
    if (paragraph.length < 80 && /^[A-ZÀ-Ú0-9 .,:;\-—–'\"]+$/.test(paragraph)) {
      lines.push(`**${paragraph}**`)
    } else {
      lines.push(paragraph)
    }
    lines.push('')
  }

  return lines.join('\n')
}
