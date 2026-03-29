import React from 'react'
import { useStore } from '../store/useStore'

export default function WelcomeScreen() {
  const { setScreen } = useStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      {/* Logo */}
      <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl flex items-center justify-center mb-8 shadow-elevated shadow-accent-500/20">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
        Anonimizzatore
      </h2>

      <p className="text-base text-navy-300 mb-2 max-w-lg leading-relaxed">
        Pseudo-anonimizzazione di sentenze e atti legali.
      </p>
      <p className="text-sm text-navy-400 mb-10 max-w-md leading-relaxed">
        Riconoscimento automatico di nomi, organizzazioni, luoghi, codici fiscali
        e altri dati personali con sostituzione tramite pseudonimi coerenti.
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-2xl w-full">
        <div className="bg-navy-900/60 backdrop-blur-sm rounded-xl p-5 border border-navy-700/40 shadow-card">
          <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4d94ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 className="font-semibold text-navy-100 mb-1 text-sm">100% Offline</h3>
          <p className="text-xs text-navy-400 leading-relaxed">Nessun dato lascia il computer. Conforme al GDPR.</p>
        </div>
        <div className="bg-navy-900/60 backdrop-blur-sm rounded-xl p-5 border border-navy-700/40 shadow-card">
          <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4d94ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
            </svg>
          </div>
          <h3 className="font-semibold text-navy-100 mb-1 text-sm">NER Intelligente</h3>
          <p className="text-xs text-navy-400 leading-relaxed">Riconoscimento automatico di entit&agrave; con regex e modello AI.</p>
        </div>
        <div className="bg-navy-900/60 backdrop-blur-sm rounded-xl p-5 border border-navy-700/40 shadow-card">
          <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center mb-3 mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4d94ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <h3 className="font-semibold text-navy-100 mb-1 text-sm">Multi-formato</h3>
          <p className="text-xs text-navy-400 leading-relaxed">Supporta PDF, DOCX e file di testo.</p>
        </div>
      </div>

      <button
        onClick={() => setScreen('dropzone')}
        className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-500 hover:to-accent-600 text-white font-medium px-10 py-3 rounded-xl shadow-lg shadow-accent-600/25 hover:shadow-accent-500/30 transition-all"
      >
        Inizia
      </button>
    </div>
  )
}
