import { Entity } from '../../shared/types'

/**
 * Replace all entity occurrences in text with their pseudonyms.
 * Sorts entities by length (longest first) to avoid partial replacements.
 */
export function replaceEntitiesInText(text: string, entities: Entity[]): string {
  // Sort by text length descending to replace longest matches first
  const sorted = [...entities]
    .filter(e => e.confirmed)
    .sort((a, b) => b.text.length - a.text.length)

  let result = text

  for (const entity of sorted) {
    // Escape special regex characters in entity text
    const escaped = entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Case-insensitive replacement
    const regex = new RegExp(escaped, 'gi')
    result = result.replace(regex, entity.pseudonym)
  }

  return result
}
