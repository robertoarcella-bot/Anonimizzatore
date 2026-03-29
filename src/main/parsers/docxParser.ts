import { DocumentInfo } from '../../shared/types'
import { basename } from 'path'
import { readFileSync } from 'fs'
import mammoth from 'mammoth'

export async function parseDocx(filePath: string): Promise<DocumentInfo> {
  const buffer = readFileSync(filePath)
  const result = await mammoth.extractRawText({ buffer })

  return {
    filePath,
    fileName: basename(filePath),
    fileType: 'docx',
    textContent: result.value.trim()
  }
}
