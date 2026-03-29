import { EntityType } from '../../shared/types'

/**
 * Generates clearly identifiable pseudonyms that cannot be confused with real data.
 * Uses bracketed labels like [PERSONA_1], [ORG_2], [LUOGO_3] etc.
 * This makes it immediately obvious which parts of the document have been anonymized.
 */
export class PseudonymGenerator {
  private counters: Record<string, number> = {}
  private dictionary: Map<string, string> = new Map()

  constructor(existingDictionary?: Record<string, string>) {
    if (existingDictionary) {
      for (const [key, value] of Object.entries(existingDictionary)) {
        this.dictionary.set(key.toLowerCase(), value)
      }
    }
  }

  generate(originalText: string, type: EntityType): string {
    const key = originalText.toLowerCase().trim()

    if (this.dictionary.has(key)) {
      return this.dictionary.get(key)!
    }

    const pseudonym = this.createPseudonym(type)
    this.dictionary.set(key, pseudonym)
    return pseudonym
  }

  private createPseudonym(type: EntityType): string {
    switch (type) {
      case 'PERSONA':
        return this.nextLabel('PERSONA')
      case 'ORGANIZZAZIONE':
        return this.nextLabel('ORG')
      case 'LUOGO':
        return this.nextLabel('LUOGO')
      case 'INDIRIZZO':
        return this.nextLabel('INDIRIZZO')
      case 'CODICE_FISCALE':
        return this.nextLabel('CF')
      case 'PARTITA_IVA':
        return this.nextLabel('PIVA')
      case 'IBAN':
        return this.nextLabel('IBAN')
      case 'EMAIL':
        return this.nextLabel('EMAIL')
      case 'TELEFONO':
        return this.nextLabel('TEL')
      case 'DATA_NASCITA':
        return this.nextLabel('DATA')
      case 'NUMERO_DOCUMENTO':
        return this.nextLabel('DOC')
      default:
        return '[OMISSIS]'
    }
  }

  private nextLabel(prefix: string): string {
    const idx = (this.counters[prefix] || 0) + 1
    this.counters[prefix] = idx
    return `[${prefix}_${idx}]`
  }

  getDictionary(): Record<string, string> {
    const dict: Record<string, string> = {}
    this.dictionary.forEach((value, key) => {
      dict[key] = value
    })
    return dict
  }
}
