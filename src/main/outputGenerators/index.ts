import { Entity } from '../../shared/types'
import { anonymizePdf } from './pdfGenerator'
import { anonymizeDocx } from './docxGenerator'
import { anonymizeTxt } from './txtGenerator'
import { extname } from 'path'

export async function anonymizeDocument(
  filePath: string,
  entities: Entity[],
  outputDir: string
): Promise<string> {
  const ext = extname(filePath).toLowerCase()

  switch (ext) {
    case '.pdf':
      return anonymizePdf(filePath, entities, outputDir)
    case '.docx':
      return anonymizeDocx(filePath, entities, outputDir)
    case '.txt':
      return anonymizeTxt(filePath, entities, outputDir)
    default:
      throw new Error(`Formato di output non supportato: ${ext}`)
  }
}
