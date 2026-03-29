import React, { useEffect } from 'react'
import { useStore } from '../store/useStore'

export default function ErrorOverlay() {
  const { error, setError } = useStore()

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error, setError])

  if (!error) return null

  return (
    <div className="fixed bottom-6 right-6 max-w-sm z-50">
      <div className="bg-red-950/90 backdrop-blur-sm border border-red-800/40 rounded-xl p-4 shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-800/30">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-200 mb-0.5">Errore</p>
            <p className="text-xs text-red-300/80 break-words">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-300 flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
