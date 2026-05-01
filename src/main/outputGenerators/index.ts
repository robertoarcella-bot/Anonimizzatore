import { Entity } from '../../shared/types'
import { anonymizePdf } from './pdfGenerator'
import { anonymizeDocx } from './docxGenerator'
import { anonymizeTxt } from './txtGenerator'
import { anonymizeToMarkdown } from './mdGenerator'
import { extname } from 'path'

export interface AnonymizationResult {
  primary: string           // path of the format-matching output (PDF/DOCX/TXT/MD)
  markdown: string | null   // path of the Markdown export (null if primary is already MD)
}

export async function anonymizeDocument(
  filePath: string,
  entities: Entity[],
  outputDir: string
): Promise<AnonymizationResult> {
  const ext = extname(filePath).toLowerCase()

  let primary: string
  switch (ext) {
    case '.pdf':
      primary = await anonymizePdf(filePath, entities, outputDir)
      break
    case '.docx':
      primary = await anonymizeDocx(filePath, entities, outputDir)
      break
    case '.txt':
      primary = await anonymizeTxt(filePath, entities, outputDir)
      break
    case '.md':
      // Markdown is plain text — direct replacement preserves the markdown structure
      primary = await anonymizeTxt(filePath, entities, outputDir)
      break
    default:
      throw new Error(`Formato di output non supportato: ${ext}`)
  }

  // For .md input the primary is already markdown; skip the redundant export
  const markdown = ext === '.md'
    ? null
    : await anonymizeToMarkdown(filePath, entities, outputDir)

  return { primary, markdown }
}
