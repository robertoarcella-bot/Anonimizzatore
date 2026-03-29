import { Entity } from '../../shared/types'
import { readFileSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import AdmZip from 'adm-zip'
import { replaceEntitiesInText } from './textReplacer'

/**
 * Anonymize a DOCX file by modifying the XML content inside the zip.
 * DOCX files are zip archives containing XML files.
 */
export async function anonymizeDocx(
  filePath: string,
  entities: Entity[],
  outputDir: string
): Promise<string> {
  const confirmedEntities = entities.filter(e => e.confirmed)
  if (confirmedEntities.length === 0) {
    throw new Error('Nessuna entità confermata da anonimizzare')
  }

  const zip = new AdmZip(filePath)
  const entries = zip.getEntries()

  // Process each XML file in the docx
  for (const entry of entries) {
    if (
      entry.entryName.endsWith('.xml') &&
      (entry.entryName.startsWith('word/') || entry.entryName === '[Content_Types].xml')
    ) {
      let xmlContent = entry.getData().toString('utf-8')

      // Replace entities in the XML text content
      // We need to handle XML tags carefully - only replace text between tags
      xmlContent = replaceInXml(xmlContent, confirmedEntities)

      zip.updateFile(entry.entryName, Buffer.from(xmlContent, 'utf-8'))
    }
  }

  const outputFileName = `ANONIMIZZATO_${basename(filePath)}`
  const outputPath = join(outputDir, outputFileName)
  zip.writeZip(outputPath)

  return outputPath
}

/**
 * Replace entity text within XML while preserving XML tags.
 * Handles the case where entity text might span multiple XML runs.
 */
function replaceInXml(xml: string, entities: Entity[]): string {
  // Extract text nodes (content between > and <)
  // Replace entity occurrences in the concatenated text
  const sorted = [...entities].sort((a, b) => b.text.length - a.text.length)

  let result = xml

  for (const entity of sorted) {
    const escaped = entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Only match text content, not inside XML tags
    // This regex matches the entity text that appears between XML tags
    const regex = new RegExp(`(>)([^<]*?)(${escaped})([^<]*?)(<)`, 'gi')
    result = result.replace(regex, `$1$2${escapeXml(entity.pseudonym)}$4$5`)
  }

  return result
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
