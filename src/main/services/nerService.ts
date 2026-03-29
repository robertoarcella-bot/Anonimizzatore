import { Entity, EntityType } from '../../shared/types'
import { findRegexEntities } from './regexPatterns'
import { PseudonymGenerator } from './pseudonymGenerator'
import { NOMI_ITALIANI, COGNOMI_ITALIANI, PREFISSI_NOME, PAROLE_LEGALI } from './italianNames'
import { v4 as uuidv4 } from 'uuid'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Transformers.js pipeline - loaded lazily
let nerPipeline: any = null
let pipelineLoading = false
let pipelineError: string | null = null

// Use a well-known multilingual NER model that works with ONNX WASM
const MODEL_ID = 'Xenova/bert-base-NER'

function getModelCacheDir(): string {
  const dir = join(app.getPath('userData'), 'models')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

// Map NER model labels to our entity types
const NER_LABEL_MAP: Record<string, EntityType> = {
  'B-PER': 'PERSONA',
  'I-PER': 'PERSONA',
  'B-ORG': 'ORGANIZZAZIONE',
  'I-ORG': 'ORGANIZZAZIONE',
  'B-LOC': 'LUOGO',
  'I-LOC': 'LUOGO',
  'B-MISC': 'ORGANIZZAZIONE'
}

// Stopwords to filter out false positives
const STOPWORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',
  'di', 'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'a', 'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'da', 'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle',
  'in', 'nel', 'nello', 'nella', 'nei', 'negli', 'nelle',
  'su', 'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle',
  'con', 'per', 'tra', 'fra', 'e', 'ed', 'o', 'od',
  'ma', 'che', 'se', 'non', 'né', 'si', 'ci', 'vi',
  'art', 'art.', 'comma', 'n.', 'nr.', 'pag.', 'p.', 'ss.',
  'sent.', 'ord.', 'dec.', 'reg.', 'cass.', 'app.',
  'tribunale', 'corte', 'giudice', 'presidente', 'procuratore',
  'avvocato', 'avv.', 'dott.', 'dr.', 'sig.', 'sig.ra',
  'attore', 'convenuto', 'ricorrente', 'resistente', 'imputato',
  'parte', 'civile', 'penale', 'causa', 'procedimento',
  'sentenza', 'ordinanza', 'decreto', 'udienza', 'camera',
  'consiglio', 'sezione', 'repubblica', 'italiana', 'stato',
  'ministero', 'comune', 'provincia', 'regione', 'italia'
])

export async function isModelDownloaded(): Promise<boolean> {
  try {
    const cacheDir = getModelCacheDir()
    // Check if model files exist in cache
    return existsSync(cacheDir)
  } catch {
    return false
  }
}

export async function loadNerPipeline(
  onProgress?: (progress: { percent: number; message: string }) => void
): Promise<void> {
  if (nerPipeline) return
  if (pipelineLoading) return
  pipelineLoading = true
  pipelineError = null

  try {
    onProgress?.({ percent: 5, message: 'Inizializzazione Transformers.js...' })

    // Use Function constructor to create a dynamic import that the bundler won't process
    // This ensures @xenova/transformers loads from node_modules at runtime with native ONNX bindings
    const dynamicImport = new Function('moduleName', 'return import(moduleName)')
    const transformers = await dynamicImport('@xenova/transformers')
    const { pipeline, env } = transformers

    // Set cache dir for model downloads
    env.cacheDir = getModelCacheDir()
    env.allowLocalModels = true
    env.allowRemoteModels = true

    onProgress?.({ percent: 10, message: 'Scaricamento modello NER...' })

    nerPipeline = await pipeline('token-classification', MODEL_ID, {
      quantized: true,
      progress_callback: (data: any) => {
        if (data.status === 'progress' && data.progress) {
          onProgress?.({
            percent: Math.min(10 + data.progress * 0.85, 98),
            message: `Scaricamento modello: ${Math.round(data.progress)}%`
          })
        }
        if (data.status === 'ready') {
          onProgress?.({ percent: 99, message: 'Modello caricato, inizializzazione...' })
        }
      }
    })

    pipelineLoading = false
    onProgress?.({ percent: 100, message: 'Modello NER pronto' })
  } catch (error: any) {
    pipelineLoading = false
    pipelineError = error.message
    console.error('Failed to load NER pipeline:', error)
    throw error
  }
}

export function getNerStatus(): { ready: boolean; loading: boolean; error: string | null } {
  return {
    ready: nerPipeline !== null,
    loading: pipelineLoading,
    error: pipelineError
  }
}

// Split text into manageable chunks for the model
function splitIntoChunks(text: string, maxWords: number = 400): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let currentChunk: string[] = []
  let wordCount = 0

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).length
    if (wordCount + words > maxWords && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '))
      currentChunk = []
      wordCount = 0
    }
    currentChunk.push(sentence)
    wordCount += words
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }

  return chunks
}

// Merge B- and I- tokens into full entity spans
function mergeNerTokens(
  results: Array<{ entity: string; word: string; score: number; start: number; end: number }>
): Array<{ text: string; type: EntityType; score: number }> {
  const merged: Array<{ text: string; type: EntityType; score: number }> = []
  let current: { text: string; type: EntityType; score: number } | null = null

  for (const token of results) {
    const entityType = NER_LABEL_MAP[token.entity]
    if (!entityType) {
      if (current) {
        merged.push(current)
        current = null
      }
      continue
    }

    const isBegin = token.entity.startsWith('B-')
    const cleanWord = token.word.replace(/^##/, '')

    if (isBegin || !current || current.type !== entityType) {
      if (current) merged.push(current)
      current = { text: cleanWord, type: entityType, score: token.score }
    } else {
      current.text += token.word.startsWith('##') ? cleanWord : ` ${cleanWord}`
      current.score = Math.min(current.score, token.score)
    }
  }

  if (current) merged.push(current)
  return merged
}

function isValidEntity(text: string, type: EntityType): boolean {
  const cleaned = text.trim()
  if (cleaned.length < 2) return false
  if (STOPWORDS.has(cleaned.toLowerCase())) return false
  // Check against legal word blocklist
  if (PAROLE_LEGALI.has(cleaned.toLowerCase())) return false
  // For multi-word entities, check each word
  const words = cleaned.split(/\s+/)
  if (words.every(w => PAROLE_LEGALI.has(w.toLowerCase()) || STOPWORDS.has(w.toLowerCase()))) return false
  if (type === 'PERSONA') {
    if (!/^[A-ZÀ-Ú]/.test(cleaned)) return false
    if (cleaned.length < 3) return false
    // Person names should have at least one word that's not a legal term
    if (words.every(w => PAROLE_LEGALI.has(w.toLowerCase()))) return false
  }
  if (/^\d+$/.test(cleaned)) return false
  if (/^(?:n\.|art\.|comma|sentenza|ordinanza|decreto)/i.test(cleaned)) return false
  return true
}

/**
 * Find Italian person names in text using conservative matching.
 * Handles both "Nome Cognome" (mixed case) and "NOME COGNOME" (all caps in legal docs).
 */
function findItalianNames(text: string): Array<{ text: string; type: EntityType; count: number }> {
  const found: Array<{ text: string; type: EntityType; count: number }> = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  function isLegalWord(word: string): boolean {
    return PAROLE_LEGALI.has(word.toLowerCase()) || STOPWORDS.has(word.toLowerCase())
  }

  function countOccurrences(name: string): number {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matches = text.match(new RegExp(escaped, 'gi'))
    return matches ? matches.length : 0
  }

  function addMatch(name: string, minOccurrences: number = 1) {
    const key = name.toLowerCase().trim()
    if (seen.has(key)) return
    const words = name.split(/\s+/)
    if (words.some(w => isLegalWord(w))) return
    if (words.some(w => w.length < 2)) return
    const count = countOccurrences(name)
    if (count < minOccurrences) return
    seen.add(key)
    found.push({ text: name, type: 'PERSONA', count })
  }

  // === STRATEGY 1: ALL-CAPS names (very common in Italian legal documents) ===
  // Match: 2-4 consecutive ALL-CAPS words, each 2+ letters
  // Legal docs write names like "GARRI FABRIZIA", "LUCA MATTEO DAFFRA", "CARLA D'ALOISIO"
  const capsPattern = /\b([A-ZÀ-Ú]{2,}(?:['''][A-ZÀ-Ú]+)?(?:\s+[A-ZÀ-Ú]{2,}(?:['''][A-ZÀ-Ú]+)?){1,3})\b/g
  while ((match = capsPattern.exec(text)) !== null) {
    const fullMatch = match[1].trim()
    const words = fullMatch.split(/\s+/)
    // At least one word must be a known name or surname
    const hasKnownName = words.some(w => NOMI_ITALIANI.has(w.toLowerCase()))
    const hasKnownSurname = words.some(w => COGNOMI_ITALIANI.has(w.toLowerCase()))
    // All words must NOT be legal terms
    const allNonLegal = words.every(w => !isLegalWord(w))

    if (allNonLegal && (hasKnownName || hasKnownSurname)) {
      const key = fullMatch.toLowerCase().trim()
      if (!seen.has(key)) {
        seen.add(key)
        const count = countOccurrences(fullMatch)
        found.push({ text: fullMatch, type: 'PERSONA', count: Math.max(count, 1) })
      }
    }
  }

  // === STRATEGY 2: Names after title prefixes (Sig., Avv., Dott.) ===
  // Works for both "Avv. Mario Rossi" and "avvocato LUCA MATTEO DAFFRA"
  const prefixPattern = PREFISSI_NOME.join('|')
  // Mixed case after prefix
  const afterPrefixMixed = new RegExp(
    `(?:${prefixPattern})\\s+([A-ZÀ-Ú][a-zà-ú]{2,}(?:\\s+[A-ZÀ-Ú][a-zà-ú]{2,}){0,2})`,
    'gi'
  )
  while ((match = afterPrefixMixed.exec(text)) !== null) {
    const name = match[1]?.trim()
    if (name && name.length > 3) addMatch(name)
  }
  // ALL CAPS after prefix
  const afterPrefixCaps = new RegExp(
    `(?:${prefixPattern})\\s+([A-ZÀ-Ú]{2,}(?:\\s+[A-ZÀ-Ú]{2,}){0,3})`,
    'gi'
  )
  while ((match = afterPrefixCaps.exec(text)) !== null) {
    const name = match[1]?.trim()
    if (name && name.length > 3) addMatch(name)
  }

  // === STRATEGY 3: Names after legal context keywords ===
  // "dall'avvocato NOME", "dagli avvocati NOME", "Presidente: NOME"
  const contextPrefixes = [
    "dall'avvocato", "dagli avvocati", "dall'avv\\.",
    "presidente:?", "relatore:?", "consigliere:?",
    "ricorrente", "controricorrente",
    "proposto da:?", "difes[oa] (?:da|dall'avv)"
  ]
  const contextPattern = new RegExp(
    `(?:${contextPrefixes.join('|')})\\s+([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú'']+(?:\\s+[A-ZÀ-Ú][A-ZÀ-Úa-zà-ú'']+){0,3})`,
    'gi'
  )
  while ((match = contextPattern.exec(text)) !== null) {
    const name = match[1]?.trim()
    if (name && name.length > 3) addMatch(name)
  }

  // === STRATEGY 4: Mixed case "Nome Cognome" with dictionary match ===
  // Both words must be in dictionaries (highest confidence for mixed case)
  const mixedPattern = /\b([A-ZÀ-Ú][a-zà-ú]{2,})\s+([A-ZÀ-Ú][a-zà-ú]{2,})\b/g
  while ((match = mixedPattern.exec(text)) !== null) {
    const w1 = match[1], w2 = match[2]
    if (NOMI_ITALIANI.has(w1.toLowerCase()) && COGNOMI_ITALIANI.has(w2.toLowerCase())) {
      addMatch(`${w1} ${w2}`)
    }
    if (COGNOMI_ITALIANI.has(w1.toLowerCase()) && NOMI_ITALIANI.has(w2.toLowerCase())) {
      addMatch(`${w1} ${w2}`)
    }
  }

  return found
}

function deduplicateEntities(
  entities: Map<string, { type: EntityType; count: number; source: 'regex' | 'ner' }>
): Map<string, { type: EntityType; count: number; source: 'regex' | 'ner' }> {
  const keys = Array.from(entities.keys())

  for (const keyA of keys) {
    if (!entities.has(keyA)) continue
    for (const keyB of keys) {
      if (keyA === keyB || !entities.has(keyB)) continue
      const dataA = entities.get(keyA)!
      const dataB = entities.get(keyB)!
      if (dataA.type !== dataB.type) continue

      // Remove shorter entity if it's fully contained in a longer one
      if (keyB.includes(keyA) && keyA !== keyB) {
        entities.delete(keyA)
        break
      }

      // Remove permutations: "orio attilio franco" vs "attilio franco orio"
      // (same words in different order = same person)
      const wordsA = new Set(keyA.toLowerCase().split(/\s+/))
      const wordsB = new Set(keyB.toLowerCase().split(/\s+/))
      if (wordsA.size === wordsB.size && wordsA.size >= 2) {
        const allMatch = [...wordsA].every(w => wordsB.has(w))
        if (allMatch) {
          // Keep the one with more occurrences, or the longer text
          if (dataA.count < dataB.count || (dataA.count === dataB.count && keyA.length < keyB.length)) {
            entities.delete(keyA)
            break
          } else {
            entities.delete(keyB)
          }
        }
      }
    }
  }

  return entities
}

export async function analyzeText(
  text: string,
  existingDictionary?: Record<string, string>,
  onProgress?: (progress: { percent: number; message: string }) => void
): Promise<{ entities: Entity[]; dictionary: Record<string, string> }> {
  const pseudonymGen = new PseudonymGenerator(existingDictionary)
  const entityMap = new Map<string, { type: EntityType; count: number; source: 'regex' | 'ner' }>()

  // Step 1: Regex-based extraction
  onProgress?.({ percent: 10, message: 'Analisi pattern strutturati...' })
  const regexMatches = findRegexEntities(text)

  for (const match of regexMatches) {
    const key = match.text.toLowerCase().trim()
    const existing = entityMap.get(key)
    if (existing) {
      existing.count++
    } else {
      entityMap.set(key, { type: match.type, count: 1, source: 'regex' })
    }
  }

  // Step 1b: Dictionary-based name detection (Italian names + surnames)
  onProgress?.({ percent: 20, message: 'Ricerca nomi italiani nel testo...' })
  const dictionaryMatches = findItalianNames(text)
  for (const match of dictionaryMatches) {
    const key = match.text.toLowerCase().trim()
    const existing = entityMap.get(key)
    if (existing) {
      existing.count++
    } else {
      entityMap.set(key, { type: match.type, count: match.count, source: 'regex' })
    }
  }

  // Step 2: NER model-based extraction (if model is loaded)
  if (nerPipeline) {
    onProgress?.({ percent: 30, message: 'Analisi NER in corso...' })
    const chunks = splitIntoChunks(text)

    for (let i = 0; i < chunks.length; i++) {
      const progress = 30 + (i / chunks.length) * 50
      onProgress?.({ percent: progress, message: `Analisi NER: ${i + 1}/${chunks.length} blocchi` })

      try {
        const results = await nerPipeline(chunks[i], {
          aggregation_strategy: 'none'
        })

        const merged = mergeNerTokens(results)

        for (const entity of merged) {
          if (entity.score < 0.5) continue
          if (!isValidEntity(entity.text, entity.type)) continue

          const key = entity.text.toLowerCase().trim()
          const existing = entityMap.get(key)
          if (existing) {
            existing.count++
          } else {
            entityMap.set(key, { type: entity.type, count: 1, source: 'ner' })
          }
        }
      } catch (err) {
        console.error(`Error processing chunk ${i}:`, err)
      }
    }
  } else {
    onProgress?.({ percent: 50, message: 'Modello NER non disponibile, solo analisi regex...' })
  }

  // Step 3: Deduplicate
  onProgress?.({ percent: 85, message: 'Deduplicazione entit\u00e0...' })
  const deduped = deduplicateEntities(entityMap)

  // Step 4: Generate pseudonyms and build entity list
  onProgress?.({ percent: 90, message: 'Generazione pseudonimi...' })
  const entities: Entity[] = []

  for (const [entityText, data] of deduped) {
    const originalText = findOriginalCase(entityText, regexMatches.map(m => m.text))
    const pseudonym = pseudonymGen.generate(originalText, data.type)

    entities.push({
      id: uuidv4(),
      text: originalText,
      type: data.type,
      pseudonym,
      confirmed: true,
      occurrences: data.count,
      source: data.source
    })
  }

  entities.sort((a, b) => b.occurrences - a.occurrences)
  onProgress?.({ percent: 100, message: 'Analisi completata' })

  return { entities, dictionary: pseudonymGen.getDictionary() }
}

function findOriginalCase(lowerText: string, candidates: string[]): string {
  for (const candidate of candidates) {
    if (candidate.toLowerCase().trim() === lowerText) {
      return candidate.trim()
    }
  }
  return lowerText.replace(/\b\w/g, c => c.toUpperCase())
}
