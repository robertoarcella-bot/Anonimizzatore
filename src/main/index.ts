import { app, BrowserWindow, shell, Menu } from 'electron'
import { join } from 'path'
import { registerIpcHandlers } from './ipcHandlers'
import { loadNerPipeline } from './services/nerService'

let mainWindow: BrowserWindow | null = null

function sendModelProgress(progress: { percent: number; message: string }) {
  if (mainWindow) {
    mainWindow.webContents.send('model-status', progress)
  }
}

function buildItalianMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        { label: 'Apri documento...', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu-open-file') },
        { type: 'separator' },
        { label: 'Esci', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
      ]
    },
    {
      label: 'Modifica',
      submenu: [
        { label: 'Annulla', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Ripeti', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Taglia', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copia', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Incolla', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Seleziona tutto', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'Visualizza',
      submenu: [
        { label: 'Ricarica', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Ricarica forzata', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Zoom avanti', accelerator: 'CmdOrCtrl+=', role: 'zoomIn' },
        { label: 'Zoom indietro', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { label: 'Dimensione originale', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { type: 'separator' },
        { label: 'Schermo intero', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Finestra',
      submenu: [
        { label: 'Riduci a icona', role: 'minimize' },
        { label: 'Chiudi', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: 'Aiuto',
      submenu: [
        {
          label: 'Guida all\'uso',
          accelerator: 'F1',
          click: () => {
            mainWindow?.webContents.send('show-guide')
          }
        },
        { type: 'separator' },
        {
          label: 'Informazioni su Anonimizzatore',
          click: () => {
            const { dialog } = require('electron')
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Anonimizzatore',
              message: 'Anonimizzatore v1.0.0',
              detail: 'Software per la pseudo-anonimizzazione di sentenze e atti legali.\n\nAutore: Avv. Roberto Arcella\n\nQuesta applicazione è un fork del progetto Anonimator dell\'Avv. Filippo Strozzi, realizzata in collaborazione con il Laboratorio Avvocati e Magistrati del Distretto della Corte d\'Appello di Napoli.\n\nUtilizza NER (Named Entity Recognition) e pattern regex per identificare automaticamente dati personali.\n\n100% offline - Conforme al GDPR.'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Anonimizzatore',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Auto-load NER model in background after window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    loadNerPipeline((progress) => sendModelProgress(progress))
      .then(() => {
        sendModelProgress({ percent: 100, message: 'ready' })
      })
      .catch((err) => {
        console.error('NER model auto-load failed:', err.message)
        sendModelProgress({ percent: -1, message: err.message })
      })
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  buildItalianMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
