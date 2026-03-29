import React, { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

export default function ModelDownloadScreen() {
  const { setScreen, setModelReady, progress } = useStore()
  const [status, setStatus] = useState<'checking' | 'downloading' | 'ready' | 'error'>('checking')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    checkAndDownload()
  }, [])

  async function checkAndDownload() {
    try {
      setStatus('checking')
      await window.api.checkModel()

      setStatus('downloading')
      const result = await window.api.downloadModel()

      if (result.success) {
        setStatus('ready')
        setModelReady(true)
        setTimeout(() => setScreen('dropzone'), 800)
      } else {
        setStatus('error')
        setErrorMsg(result.error || 'Errore sconosciuto')
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Errore di connessione')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="bg-navy-900/60 backdrop-blur-sm rounded-2xl p-8 border border-navy-700/40 shadow-elevated max-w-md w-full">
        <h2 className="text-xl font-bold text-navy-100 mb-6">Modello NER</h2>

        {status === 'checking' && (
          <div>
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-navy-300 text-sm">Verifica modello...</p>
          </div>
        )}

        {status === 'downloading' && (
          <div>
            <div className="w-full bg-navy-800 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-accent-600 to-accent-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress?.percent || 0}%` }}
              />
            </div>
            <p className="text-navy-200 text-sm">
              {progress?.message || 'Scaricamento modello NER...'}
            </p>
            <p className="text-navy-500 text-xs mt-2">
              Il modello verr&agrave; scaricato solo la prima volta (~65 MB)
            </p>
          </div>
        )}

        {status === 'ready' && (
          <div>
            <div className="w-12 h-12 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-700/40">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-navy-200">Modello NER pronto</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-red-300 text-sm mb-2">Errore nel caricamento del modello</p>
            <p className="text-navy-400 text-xs mb-5">{errorMsg}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={checkAndDownload}
                className="bg-accent-600 hover:bg-accent-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Riprova
              </button>
              <button
                onClick={() => { setModelReady(false); setScreen('dropzone') }}
                className="bg-navy-800 hover:bg-navy-700 text-navy-200 px-4 py-2 rounded-lg text-sm font-medium border border-navy-600"
              >
                Continua senza modello
              </button>
            </div>
            <p className="text-navy-500 text-xs mt-4">
              Senza modello NER, verranno usati solo i pattern regex
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
