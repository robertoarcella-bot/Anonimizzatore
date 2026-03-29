import { EntityType } from '../../shared/types'

interface RegexPattern {
  type: EntityType
  pattern: RegExp
  label: string
}

// Italian fiscal code: 6 letters + 2 digits + month letter (ABCDEHLMPRST) + day (01-71) + municipality code + check char
const CODICE_FISCALE = /\b[A-Z]{6}[0-9]{2}[ABCDEHLMPRST](?:0[1-9]|[12][0-9]|3[01]|4[1-9]|[56][0-9]|7[01])[A-Z][0-9]{3}[A-Z]\b/gi

// Partita IVA: exactly 11 digits, optionally prefixed by "IT"
const PARTITA_IVA = /\b(?:IT\s?)?[0-9]{11}\b/g

// IBAN: IT followed by 2 check digits + 1 letter + 22 alphanumeric
const IBAN = /\bIT\s?\d{2}\s?[A-Z]\s?\d{5}\s?\d{5}\s?[A-Z0-9]{12}\b/gi

// Email addresses
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g

// Phone numbers (Italian formats)
const TELEFONO = /\b(?:\+39\s?)?(?:0[0-9]{1,4}|3[0-9]{2})[\s./-]?[0-9]{3,4}[\s./-]?[0-9]{3,4}\b/g

// Date of birth patterns (dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy)
const DATA_NASCITA = /\b(?:nato|nata|nascit[oa]|data di nascita|n\.\s*il)\s*(?:il\s+|:\s*|,?\s*)(\d{1,2}[/.\\-]\d{1,2}[/.\\-]\d{2,4})\b/gi

// Standalone dates (common Italian formats)
const DATA_GENERICA = /\b\d{1,2}[/.\\-]\d{1,2}[/.\\-]\d{2,4}\b/g

// Italian addresses — require proper street names, NOT legal uses of "via"
// "via" MUST be capitalized (Via) AND followed by a proper noun (capitalized) — not adjectives
// This prevents matching "via principale", "via subordinata", "via equitativa", etc.
const INDIRIZZO_VIA = /\bVia\s+(?:del|dello|della|dei|degli|delle|di)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*(?:\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?)?|\bVia\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*(?:\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?)?/g

// Other street types (less ambiguous than "via") — case insensitive
const INDIRIZZO_ALTRI = /\b(?:viale|piazza|piazzale|largo|vicolo|contrada|località|c\.so|p\.za|p\.le|v\.le)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*(?:\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?)?/gi

// "strada" only with number (to avoid "strada presentava un...")
const INDIRIZZO_STRADA = /\b(?:strada)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?/gi

// "corso" requires a number to be considered an address
const INDIRIZZO_CORSO = /\b(?:corso)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?/gi

// Document numbers (carta d'identità, passaporto)
const NUMERO_DOCUMENTO = /\b(?:C[AI]\d{5}[A-Z]{2}|[A-Z]{2}\d{7}|YA\d{7}|[A-Z]{2}\d{5}[A-Z]{2})\b/g

// Words that CANNOT follow "Via" in an address — legal/procedural terms
const VIA_BLOCKLIST = new Set([
  'principale', 'subordinata', 'subordinato', 'equitativa', 'equitativo',
  'istruttoria', 'istruttorio', 'generale', 'ordinaria', 'ordinario',
  'straordinaria', 'straordinario', 'giudiziale', 'giudiziaria',
  'amministrativa', 'amministrativo', 'preferenziale', 'alternativa',
  'breve', 'cautelare', 'incidentale', 'autonoma', 'diretta',
  'residuale', 'esclusiva', 'prioritaria', 'telematica', 'informatica',
  'orale', 'scritta', 'formale', 'informale', 'preliminare',
  'definitiva', 'provvisoria', 'urgente', 'sommaria',
  'presentava', 'presentano', 'presenta'
])

export const REGEX_PATTERNS: RegexPattern[] = [
  { type: 'CODICE_FISCALE', pattern: CODICE_FISCALE, label: 'Codice Fiscale' },
  { type: 'PARTITA_IVA', pattern: PARTITA_IVA, label: 'Partita IVA' },
  { type: 'IBAN', pattern: IBAN, label: 'IBAN' },
  { type: 'EMAIL', pattern: EMAIL, label: 'Email' },
  { type: 'TELEFONO', pattern: TELEFONO, label: 'Telefono' },
  { type: 'DATA_NASCITA', pattern: DATA_NASCITA, label: 'Data di Nascita' },
  { type: 'INDIRIZZO', pattern: INDIRIZZO_VIA, label: 'Indirizzo (via)' },
  { type: 'INDIRIZZO', pattern: INDIRIZZO_ALTRI, label: 'Indirizzo' },
  { type: 'INDIRIZZO', pattern: INDIRIZZO_STRADA, label: 'Indirizzo (strada)' },
  { type: 'INDIRIZZO', pattern: INDIRIZZO_CORSO, label: 'Indirizzo (corso)' },
  { type: 'NUMERO_DOCUMENTO', pattern: NUMERO_DOCUMENTO, label: 'Numero Documento' }
]

export interface RegexMatch {
  text: string
  type: EntityType
  start: number
  end: number
}

export function findRegexEntities(text: string): RegexMatch[] {
  const matches: RegexMatch[] = []

  for (const { type, pattern } of REGEX_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const matchedText = type === 'DATA_NASCITA' && match[1] ? match[1] : match[0]
      const trimmed = matchedText.trim()

      // Filter out false-positive "Via" addresses
      if (type === 'INDIRIZZO' && /^Via\s/i.test(trimmed)) {
        const afterVia = trimmed.replace(/^Via\s+/i, '').split(/\s/)[0].toLowerCase()
        if (VIA_BLOCKLIST.has(afterVia)) continue
      }

      matches.push({
        text: trimmed,
        type,
        start: match.index,
        end: match.index + match[0].length
      })
    }
  }

  return matches
}
