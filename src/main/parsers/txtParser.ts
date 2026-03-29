import { DocumentInfo } from '../../shared/types'
import { basename } from 'path'
import { readFileSync } from 'fs'

export async function parseTxt(filePath: string): Promise<DocumentInfo> {
  const text = readFileSync(filePath, 'utf-8')

  return {
    filePath,
    fileName: basename(filePath),
    fileType: 'txt',
    textContent: text.trim()
  }
}
