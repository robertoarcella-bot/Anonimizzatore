import React from 'react'
import { useStore } from '../store/useStore'

export default function SuccessScreen() {
  const { outputPath, markdownPath, replacementCount, setScreen, reset } = useStore()

  const handleNewFile = () => {
    reset()
    setScreen('dropzone')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="bg-navy-900/60 backdrop-blur-sm rounded-2xl p-10 border border-navy-700/40 shadow-elevated max-w-lg w-full">
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
          {replacementCount} {replacementCount === 1 ? 'entità sostituita' : 'entità sostituite'} con successo.
        </p>

        {/* Output paths */}
        <div className="space-y-3 mb-8 text-left">
          {outputPath && (
            <FileCard label="Documento principale" path={outputPath} accent="accent" />
          )}
          {markdownPath && (
            <FileCard label="Esportazione Markdown" path={markdownPath} accent="emerald" />
          )}
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

function FileCard({ label, path, accent }: { label: string; path: string; accent: 'accent' | 'emerald' }) {
  const labelColor = accent === 'emerald' ? 'text-emerald-300' : 'text-accent-300'
  const ext = path.split('.').pop()?.toUpperCase() || ''

  return (
    <div className="bg-navy-800/60 rounded-lg p-4 border border-navy-700/30">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-navy-500 uppercase tracking-wider font-medium">{label}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          accent === 'emerald' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-accent-900/40 text-accent-300'
        }`}>
          {ext}
        </span>
      </div>
      <p className={`text-sm font-mono break-all leading-relaxed ${labelColor}`}>{path}</p>
    </div>
  )
}
