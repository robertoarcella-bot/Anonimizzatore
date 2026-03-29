import React from 'react'
import { useStore } from '../store/useStore'

export default function SuccessScreen() {
  const { outputPath, replacementCount, setScreen, reset } = useStore()

  const handleNewFile = () => {
    reset()
    setScreen('dropzone')
  }

  // Extract folder and filename from path
  const fileName = outputPath?.split(/[\\/]/).pop() || ''
  const folder = outputPath?.substring(0, outputPath.lastIndexOf(fileName.charAt(0) === '' ? '' : fileName) - 1) || ''

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-navy-900/60 backdrop-blur-sm rounded-2xl p-10 border border-navy-700/40 shadow-elevated max-w-md w-full">
        {/* Success icon */}
        <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-700/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Anonimizzazione completata
        </h2>

        <p className="text-navy-300 mb-6">
          {replacementCount} {replacementCount === 1 ? 'entit\u00e0 sostituita' : 'entit\u00e0 sostituite'} con successo.
        </p>

        {/* Output path */}
        <div className="bg-navy-800/60 rounded-lg p-4 mb-8 text-left border border-navy-700/30">
          <p className="text-xs text-navy-500 mb-1.5 uppercase tracking-wider font-medium">File salvato</p>
          <p className="text-sm text-accent-300 font-mono break-all leading-relaxed">{outputPath}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleNewFile}
            className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-500 hover:to-accent-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-accent-600/20"
          >
            Anonimizza un altro documento
          </button>
        </div>
      </div>
    </div>
  )
}
