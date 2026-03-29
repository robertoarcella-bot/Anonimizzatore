import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC_CHANNELS, Entity } from '../shared/types'
import { parseDocument } from './parsers'
import { anonymizeDocument } from './outputGenerators'
import { analyzeText, loadNerPipeline, isModelDownloaded } from './services/nerService'
import { writeFileSync, readFileSync } from 'fs'
import { dirname } from 'path'

function sendProgress(progress: { percent: number; message: string }) {
  const win = BrowserWindow.getAllWindows()[0]
  if (win) {
    win.webContents.send('progress-update', progress)
  }
}

export function registerIpcHandlers(): void {
  // Check if NER model is downloaded
  ipcMain.handle(IPC_CHANNELS.CHECK_MODEL, async () => {
    return isModelDownloaded()
  })

  // Download/load the NER model
  ipcMain.handle(IPC_CHANNELS.DOWNLOAD_MODEL, async () => {
    try {
      await loadNerPipeline((progress) => sendProgress(progress))
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Select file dialog
  ipcMain.handle(IPC_CHANNELS.SELECT_FILE, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Seleziona documento',
      filters: [
        { name: 'Documenti', extensions: ['pdf', 'docx', 'txt'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Word', extensions: ['docx'] },
        { name: 'Testo', extensions: ['txt'] }
      ],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  // Select output directory
  ipcMain.handle(IPC_CHANNELS.SELECT_OUTPUT_DIR, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Seleziona cartella di output',
      properties: ['openDirectory', 'createDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  // Parse a document
  ipcMain.handle(IPC_CHANNELS.PARSE_DOCUMENT, async (_event, filePath: string) => {
    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: 'Nessun file selezionato' }
    }
    try {
      sendProgress({ percent: 0, message: 'Lettura documento...' })
      const doc = await parseDocument(filePath)
      sendProgress({ percent: 100, message: 'Documento letto' })
      return { success: true, data: doc }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Run NER analysis on text
  ipcMain.handle(IPC_CHANNELS.RUN_NER, async (_event, text: string, dictionary?: Record<string, string>) => {
    try {
      const result = await analyzeText(text, dictionary, (progress) => sendProgress(progress))
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Anonymize a document
  ipcMain.handle(
    IPC_CHANNELS.ANONYMIZE_DOCUMENT,
    async (_event, filePath: string, entities: Entity[], outputDir: string) => {
      try {
        sendProgress({ percent: 0, message: 'Anonimizzazione in corso...' })
        const outputPath = await anonymizeDocument(filePath, entities, outputDir)
        sendProgress({ percent: 100, message: 'Anonimizzazione completata' })
        return { success: true, data: { outputPath } }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  )

  // Export dictionary
  ipcMain.handle(IPC_CHANNELS.EXPORT_DICTIONARY, async (_event, dictionary: Record<string, string>) => {
    const result = await dialog.showSaveDialog({
      title: 'Esporta dizionario',
      defaultPath: 'dizionario_anonimizzazione.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })

    if (result.canceled || !result.filePath) return null

    writeFileSync(result.filePath, JSON.stringify(dictionary, null, 2), 'utf-8')
    return result.filePath
  })

  // Get directory of a file
  ipcMain.handle(IPC_CHANNELS.GET_FILE_DIR, async (_event, filePath: string) => {
    if (!filePath || typeof filePath !== 'string') return null
    return dirname(filePath)
  })

  // Import dictionary
  ipcMain.handle(IPC_CHANNELS.IMPORT_DICTIONARY, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Importa dizionario',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const content = readFileSync(result.filePaths[0], 'utf-8')
    return JSON.parse(content)
  })
}
