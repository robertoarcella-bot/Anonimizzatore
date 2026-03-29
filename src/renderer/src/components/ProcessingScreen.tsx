import React from 'react'
import { useStore } from '../store/useStore'

export default function ProcessingScreen() {
  const { progress, screen } = useStore()
  const isAnonymizing = screen === 'anonymizing'

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-navy-900/60 backdrop-blur-sm rounded-2xl p-10 border border-navy-700/40 shadow-elevated max-w-md w-full text-center">
        <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />

        <h2 className="text-xl font-bold text-navy-100 mb-5">
          {isAnonymizing ? 'Anonimizzazione in corso...' : 'Analisi in corso...'}
        </h2>

        {progress && (
          <>
            <div className="w-full bg-navy-800 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-accent-600 to-accent-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-sm text-navy-300">{progress.message}</p>
            <p className="text-xs text-navy-500 mt-1">{Math.round(progress.percent)}%</p>
          </>
        )}

        {!progress && (
          <p className="text-sm text-navy-400">
            {isAnonymizing
              ? 'Sostituzione delle entit\u00e0 nel documento...'
              : 'Identificazione delle entit\u00e0 nel documento...'}
          </p>
        )}
      </div>
    </div>
  )
}
