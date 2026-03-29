import { DocumentInfo } from '../../shared/types'
import { basename } from 'path'
import { readFileSync } from 'fs'

export async function parsePdf(filePath: string): Promise<DocumentInfo> {
  const fileBuffer = readFileSync(filePath)

  const { PDFParse } = require('pdf-parse')
  const parser = new PDFParse({ data: fileBuffer })
  await parser.load()

  const textResult = await parser.getText()
  const info = await parser.getInfo()

  return {
    filePath,
    fileName: basename(filePath),
    fileType: 'pdf',
    pageCount: textResult.total || info.total || 0,
    textContent: textResult.text.trim()
  }
}
