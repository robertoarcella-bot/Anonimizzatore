import { DocumentInfo } from '../../shared/types'
import { parsePdf } from './pdfParser'
import { parseDocx } from './docxParser'
import { parseTxt } from './txtParser'
import { extname } from 'path'

export async function parseDocument(filePath: string): Promise<DocumentInfo> {
  const ext = extname(filePath).toLowerCase()

  switch (ext) {
    case '.pdf':
      return parsePdf(filePath)
    case '.docx':
      return parseDocx(filePath)
    case '.txt':
      return parseTxt(filePath)
    default:
      throw new Error(`Formato file non supportato: ${ext}`)
  }
}
