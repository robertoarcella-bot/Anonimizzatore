import { EntityType } from '../../shared/types'
import { PAROLE_LEGALI } from './italianNames'

interface RegexPattern {
  type: EntityType
  pattern: RegExp
  label: string
  // If set, use capture group 1 instead of full match
  captureGroup?: number
}

// === STRUCTURED DATA PATTERNS ===

const CODICE_FISCALE = /\b[A-Z]{6}[0-9]{2}[ABCDEHLMPRST](?:0[1-9]|[12][0-9]|3[01]|4[1-9]|[56][0-9]|7[01])[A-Z][0-9]{3}[A-Z]\b/gi
const PARTITA_IVA = /\b(?:IT\s?)?[0-9]{11}\b/g
const IBAN = /\bIT\s?\d{2}\s?[A-Z]\s?\d{5}\s?\d{5}\s?[A-Z0-9]{12}\b/gi
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
const TELEFONO = /\b(?:\+39\s?)?(?:0[0-9]{1,4}|3[0-9]{2})[\s./-]?[0-9]{3,4}[\s./-]?[0-9]{3,4}\b/g
const DATA_NASCITA = /\b(?:nato|nata|nascit[oa]|data di nascita|n\.\s*il)\s*(?:il\s+|:\s*|,?\s*)(\d{1,2}[/.\\-]\d{1,2}[/.\\-]\d{2,4})\b/gi
const NUMERO_DOCUMENTO = /\b(?:C[AI]\d{5}[A-Z]{2}|[A-Z]{2}\d{7}|YA\d{7}|[A-Z]{2}\d{5}[A-Z]{2})\b/g

// === ADDRESS PATTERNS ===

const INDIRIZZO_VIA = /\bVia\s+(?:del|dello|della|dei|degli|delle|di)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*(?:\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?)?|\bVia\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*(?:\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?)?/g
const INDIRIZZO_ALTRI = /\b(?:viale|piazza|piazzale|largo|vicolo|contrada|località|c\.so|p\.za|p\.le|v\.le)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*(?:\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?)?/gi
const INDIRIZZO_STRADA = /\b(?:strada)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?/gi
const INDIRIZZO_CORSO = /\b(?:corso)\s+[A-ZÀ-Ú][a-zà-ú]{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú]+)*\s*,?\s*(?:n\.|n°|nr?\.?|civico)?\s*\d+(?:[/\-]?[A-Za-z])?/gi

// === LEGAL CONTEXTUAL PATTERNS (person names in legal documents) ===
// IMPORTANT: These patterns must NOT use the 'i' flag for the captured name part.
// The name MUST start with an uppercase letter to avoid matching verbs/adjectives
// like "ricorrente deduce", "ricorrente sembra", etc.

// "ricorrente/resistente/appellante NOME COGNOME" — name must be capitalized
const PROCESSO_PARTE = /\b(?:[Rr]icorrente|[Rr]esistente|[Aa]ppellante|[Aa]ppellat[oa]|[Cc]onvenut[oa]|[Aa]ttor[ei]|[Aa]ttrice|[Ii]ndagat[oa]|[Ii]mputat[oa]|[Qq]uerelante|[Qq]uerelat[oa]|[Pp]arte civile|[Pp]ersona offesa)\s+([A-ZÀ-Ú][a-zà-ú']{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú']+){0,3}|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]{2,}){0,3})/g

// "difeso/rappresentato dall'avv. NOME COGNOME"
const DIFENSORE = /\b(?:[Dd]ifes[oa]|[Rr]appresentat[oa]|[Aa]ssistit[oa])\s+(?:e\s+(?:difes[oa]|rappresentat[oa])\s+)?(?:dall?['']?\s*)?(?:[Aa]vv\.?|[Aa]vvocat[oa])\s+([A-ZÀ-Ú][a-zà-ú']{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú']+){0,3}|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]{2,}){0,3})/g

// "dagli avvocati NOME, NOME e NOME"
const AVV_LISTA = /\b(?:[Dd]agli\s+avvocati|[Dd]egli\s+avv\.?|[Aa]vv\.?ti)\s+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+(?:\s+[A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+){0,2}(?:\s*,\s*[A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+(?:\s+[A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+){0,2})*(?:\s+e\s+[A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+(?:\s+[A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+){0,2})?)/g

// "Firmato Da: NOME COGNOME Emesso"
const PKI_FIRMA = /\bFirmato\s+Da:?\s*([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+(?:\s+[A-ZÀ-Ú][A-ZÀ-Úa-zà-ú']+){0,3})\s*(?:Emesso|Seriale|Valido)/g

// "Presidente: NOME COGNOME"
const SENTENCE_HEADER = /\b(?:Presidente|Relatore|Consigliere|Giudice|P\.?M\.?|Sostituto):?\s+(?:[Dd]ott\.?\s*(?:ssa)?\s*)?([A-ZÀ-Ú][a-zà-ú']{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú']+){0,3}|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]{2,}){0,3})/g

// "tra NOME, nato/residente..."
const CONTRATTO_PARTE = /\b[Tt]ra\s+([A-ZÀ-Ú][a-zà-ú']{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú']+){0,3}|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]{2,}){0,3})\s*,\s*(?:nat[oa]|residente|con\s+sede|C\.?F\.?|codice\s+fiscale)/g

// "dall'avvocato NOME COGNOME"
const DALL_AVV = /\b(?:[Dd]all?['']?\s*[Aa]vv\.?(?:ocat[oa])?)\s+([A-ZÀ-Ú][a-zà-ú']{2,}(?:\s+[A-ZÀ-Ú][a-zà-ú']+){0,3}|[A-ZÀ-Ú]{2,}(?:\s+[A-ZÀ-Ú]{2,}){0,3})/g

// Words that CANNOT follow "Via" in an address
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
  // Structured data
  { type: 'CODICE_FISCALE', pattern: CODICE_FISCALE, label: 'Codice Fiscale' },
  { type: 'PARTITA_IVA', pattern: PARTITA_IVA, label: 'Partita IVA' },
  { type: 'IBAN', pattern: IBAN, label: 'IBAN' },
  { type: 'EMAIL', pattern: EMAIL, label: 'Email' },
  { type: 'TELEFONO', pattern: TELEFONO, label: 'Telefono' },
  { type: 'DATA_NASCITA', pattern: DATA_NASCITA, label: 'Data di Nascita', captureGroup: 1 },
  { type: 'NUMERO_DOCUMENTO', pattern: NUMERO_DOCUMENTO, label: 'Numero Documento' },
  // Addresses
  { type: 'INDIRIZZO', pattern: INDIRIZZO_VIA, label: 'Indirizzo (via)' },
  { type: 'INDIRIZZO', pattern: INDIRIZZO_ALTRI, label: 'Indirizzo' },
  { type: 'INDIRIZZO', pattern: INDIRIZZO_STRADA, label: 'Indirizzo (strada)' },
  { type: 'INDIRIZZO', pattern: INDIRIZZO_CORSO, label: 'Indirizzo (corso)' },
  // Legal contextual — person names
  { type: 'PERSONA', pattern: PROCESSO_PARTE, label: 'Parte processuale', captureGroup: 1 },
  { type: 'PERSONA', pattern: DIFENSORE, label: 'Difensore', captureGroup: 1 },
  { type: 'PERSONA', pattern: AVV_LISTA, label: 'Lista avvocati', captureGroup: 1 },
  { type: 'PERSONA', pattern: PKI_FIRMA, label: 'Firma digitale', captureGroup: 1 },
  { type: 'PERSONA', pattern: SENTENCE_HEADER, label: 'Intestazione sentenza', captureGroup: 1 },
  { type: 'PERSONA', pattern: CONTRATTO_PARTE, label: 'Parte contrattuale', captureGroup: 1 },
  { type: 'PERSONA', pattern: DALL_AVV, label: 'Avvocato', captureGroup: 1 }
]

export interface RegexMatch {
  text: string
  type: EntityType
  start: number
  end: number
}

export function findRegexEntities(text: string): RegexMatch[] {
  const matches: RegexMatch[] = []

  for (const { type, pattern, captureGroup } of REGEX_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      // Use capture group if specified, otherwise full match
      const matchedText = (captureGroup !== undefined && match[captureGroup])
        ? match[captureGroup]
        : match[0]
      const trimmed = matchedText.trim()

      if (!trimmed) continue

      // Filter out false-positive "Via" addresses
      if (type === 'INDIRIZZO' && /^Via\s/i.test(trimmed)) {
        const afterVia = trimmed.replace(/^Via\s+/i, '').split(/\s/)[0].toLowerCase()
        if (VIA_BLOCKLIST.has(afterVia)) continue
      }

      // Filter PERSONA matches against PAROLE_LEGALI blocklist
      if (type === 'PERSONA') {
        const words = trimmed.split(/\s+/)
        // Reject if ALL words are legal terms or too short
        const allLegal = words.every(w => PAROLE_LEGALI.has(w.toLowerCase()) || w.length < 3)
        if (allLegal) continue
        // Reject if the first word is a legal term (e.g. "deduce", "sembra", "presenta")
        if (words.length === 1 && PAROLE_LEGALI.has(words[0].toLowerCase())) continue
        // Reject if name doesn't start with uppercase (sanity check after removing 'i' flag)
        if (!/^[A-ZÀ-Ú]/.test(trimmed)) continue
      }

      // For AVV_LISTA, split comma-separated names into individual entities
      if (pattern === AVV_LISTA && trimmed.includes(',')) {
        const names = trimmed.split(/\s*,\s*|\s+e\s+/).filter(n => n.trim().length > 2)
        for (const name of names) {
          const n = name.trim()
          if (/^[A-ZÀ-Ú]/.test(n) && !PAROLE_LEGALI.has(n.toLowerCase())) {
            matches.push({ text: n, type: 'PERSONA', start: match.index, end: match.index + match[0].length })
          }
        }
        continue
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
