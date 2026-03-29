import React, { useState, useCallback, useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function DropZone() {
  const { setScreen, setDocument, setEntities, setDictionary, setError } = useStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Clear any stale errors when entering this screen
  useEffect(() => { setError(null) }, [setError])

  const handleFile = useCallback(async (filePath: string) => {
    if (!filePath) return
    setIsLoading(true)
    setError(null)
    try {
      const parseResult = await window.api.parseDocument(filePath)
      if (!parseResult.success) {
        setError(parseResult.error)
        setIsLoading(false)
        return
      }

      setDocument(parseResult.data)
      setScreen('processing')

      const nerResult = await window.api.runNer(parseResult.data.textContent)
      if (!nerResult.success) {
        setError(nerResult.error)
        setScreen('dropzone')
        setIsLoading(false)
        return
      }

      setEntities(nerResult.data.entities)
      setDictionary(nerResult.data.dictionary)
      setScreen('entity-review')
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'elaborazione')
      setScreen('dropzone')
    }
    setIsLoading(false)
  }, [setScreen, setDocument, setEntities, setDictionary, setError])

  const handleSelectFile = async () => {
    const filePath = await window.api.selectFile()
    if (filePath) {
      handleFile(filePath)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (!['pdf', 'docx', 'txt'].includes(ext || '')) {
        setError('Formato file non supportato. Usa PDF, DOCX o TXT.')
        return
      }
      // Use Electron's webUtils.getPathForFile to get the real file path
      const filePath = window.api.getPathForFile(file)
      if (filePath) {
        handleFile(filePath)
      } else {
        setError('Impossibile leggere il percorso del file. Usa il pulsante per selezionarlo.')
      }
    }
  }

  const handleImportDict = async () => {
    const dict = await window.api.importDictionary()
    if (dict) {
      setDictionary(dict)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-navy-300 text-sm">Caricamento documento...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Drop area */}
      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-accent-400 bg-accent-500/10'
            : 'border-navy-600 bg-navy-900/40 hover:border-accent-500/60 hover:bg-navy-900/60'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={handleSelectFile}
      >
        {/* Upload icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors ${
          isDragging ? 'bg-accent-500/20' : 'bg-navy-800'
        }`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#4d94ff' : '#829ab1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        <h3 className="text-base font-semibold text-navy-100 mb-2">
          Trascina qui il documento
        </h3>
        <p className="text-sm text-navy-400 mb-5">
          oppure clicca per selezionare un file
        </p>

        {/* Format badges */}
        <div className="flex gap-2 justify-center">
          <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded-md text-xs font-medium border border-red-800/30">PDF</span>
          <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-md text-xs font-medium border border-blue-800/30">DOCX</span>
          <span className="px-3 py-1 bg-navy-800 text-navy-300 rounded-md text-xs font-medium border border-navy-700/50">TXT</span>
        </div>
      </div>

      {/* Import dictionary */}
      <button
        onClick={(e) => { e.stopPropagation(); handleImportDict() }}
        className="mt-6 text-sm text-navy-500 hover:text-accent-400 transition-colors flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Importa dizionario da sessione precedente
      </button>
    </div>
  )
}
