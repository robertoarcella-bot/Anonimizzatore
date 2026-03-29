import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { IPC_CHANNELS } from '../shared/types'

const api = {
  selectFile: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_FILE),
  selectOutputDir: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_OUTPUT_DIR),
  parseDocument: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.PARSE_DOCUMENT, filePath),
  runNer: (text: string) => ipcRenderer.invoke(IPC_CHANNELS.RUN_NER, text),
  anonymizeDocument: (filePath: string, entities: any[], outputDir: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.ANONYMIZE_DOCUMENT, filePath, entities, outputDir),
  downloadModel: () => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOAD_MODEL),
  checkModel: () => ipcRenderer.invoke(IPC_CHANNELS.CHECK_MODEL),
  exportDictionary: (dictionary: Record<string, string>) =>
    ipcRenderer.invoke(IPC_CHANNELS.EXPORT_DICTIONARY, dictionary),
  importDictionary: () => ipcRenderer.invoke(IPC_CHANNELS.IMPORT_DICTIONARY),
  getFileDir: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_FILE_DIR, filePath),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  onProgress: (callback: (progress: any) => void) => {
    const handler = (_event: any, progress: any) => callback(progress)
    ipcRenderer.on('progress-update', handler)
    return () => ipcRenderer.removeListener('progress-update', handler)
  },
  onModelStatus: (callback: (status: { percent: number; message: string }) => void) => {
    const handler = (_event: any, status: any) => callback(status)
    ipcRenderer.on('model-status', handler)
    return () => ipcRenderer.removeListener('model-status', handler)
  },
  onShowGuide: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('show-guide', handler)
    return () => ipcRenderer.removeListener('show-guide', handler)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api
