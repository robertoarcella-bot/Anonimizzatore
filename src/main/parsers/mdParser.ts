import { DocumentInfo } from '../../shared/types'
import { basename } from 'path'
import { readFileSync } from 'fs'

export async function parseMd(filePath: string): Promise<DocumentInfo> {
  const text = readFileSync(filePath, 'utf-8')

  return {
    filePath,
    fileName: basename(filePath),
    fileType: 'md',
    textContent: text.trim()
  }
}
