import { Entity } from '../../shared/types'
import { readFileSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { replaceEntitiesInText } from './textReplacer'

export async function anonymizeTxt(
  filePath: string,
  entities: Entity[],
  outputDir: string
): Promise<string> {
  const confirmedEntities = entities.filter(e => e.confirmed)
  if (confirmedEntities.length === 0) {
    throw new Error('Nessuna entità confermata da anonimizzare')
  }

  const originalText = readFileSync(filePath, 'utf-8')
  const anonymizedText = replaceEntitiesInText(originalText, confirmedEntities)

  const outputFileName = `ANONIMIZZATO_${basename(filePath)}`
  const outputPath = join(outputDir, outputFileName)
  writeFileSync(outputPath, anonymizedText, 'utf-8')

  return outputPath
}
