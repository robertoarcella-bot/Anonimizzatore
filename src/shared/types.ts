// Entity types recognized by the NER system
export type EntityType =
  | 'PERSONA'
  | 'ORGANIZZAZIONE'
  | 'LUOGO'
  | 'CODICE_FISCALE'
  | 'PARTITA_IVA'
  | 'IBAN'
  | 'EMAIL'
  | 'TELEFONO'
  | 'DATA_NASCITA'
  | 'INDIRIZZO'
  | 'NUMERO_DOCUMENTO'

// A detected entity
export interface Entity {
  id: string
  text: string
  type: EntityType
  pseudonym: string
  confirmed: boolean
  occurrences: number
  source: 'regex' | 'ner' | 'manual'
}

// Document metadata
export interface DocumentInfo {
  filePath: string
  fileName: string
  fileType: 'pdf' | 'docx' | 'txt'
  pageCount?: number
  textContent: string
}

// Processing progress
export interface ProcessingProgress {
  stage: 'parsing' | 'ner' | 'anonymizing'
  percent: number
  message: string
}

// App screen states
export type AppScreen =
  | 'welcome'
  | 'model-download'
  | 'dropzone'
  | 'processing'
  | 'entity-review'
  | 'anonymizing'
  | 'success'

// Session data for persistence
export interface SessionData {
  entities: Entity[]
  dictionary: Record<string, string> // original -> pseudonym mapping
  filesProcessed: number
}

// IPC channel names
export const IPC_CHANNELS = {
  PARSE_DOCUMENT: 'parse-document',
  RUN_NER: 'run-ner',
  ANONYMIZE_DOCUMENT: 'anonymize-document',
  DOWNLOAD_MODEL: 'download-model',
  CHECK_MODEL: 'check-model',
  GET_PROGRESS: 'get-progress',
  EXPORT_DICTIONARY: 'export-dictionary',
  IMPORT_DICTIONARY: 'import-dictionary',
  SELECT_FILE: 'select-file',
  SELECT_OUTPUT_DIR: 'select-output-dir',
  GET_FILE_DIR: 'get-file-dir'
} as const
