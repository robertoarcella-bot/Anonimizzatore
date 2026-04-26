import React, { useEffect, useState } from 'react'

interface Props {
  onClose: () => void
}

type AdvancedStatus = {
  ready: boolean
  loading: boolean
  error: string | null
}

export default function SettingsModal({ onClose }: Props) {
  const [advancedMode, setAdvancedMode] = useState(false)
  const [status, setStatus] = useState<AdvancedStatus>({ ready: false, loading: false, error: null })
  const [progress, setProgress] = useState<{ percent: number; message: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([window.api.getSettings(), window.api.getAdvancedStatus()]).then(([s, st]) => {
      if (!mounted) return
      setAdvancedMode(s.advancedMode || false)
      setStatus(st)
    })

    const cleanup = window.api.onAdvancedProgress((p) => {
      setProgress(p)
      if (p.percent >= 100) {
        setStatus({ ready: true, loading: false, error: null })
        setBusy(false)
      } else if (p.percent < 0) {
        setStatus({ ready: false, loading: false, error: p.message })
        setBusy(false)
      }
    })

    return () => { mounted = false; cleanup() }
  }, [])

  const handleToggle = async () => {
    if (busy) return
    const newValue = !advancedMode
    setAdvancedMode(newValue)
    setBusy(true)
    setProgress(newValue ? { percent: 0, message: 'Avvio scaricamento...' } : null)

    try {
      const result = await window.api.setAdvancedMode(newValue)
      if (!result.success) {
        setStatus({ ready: false, loading: false, error: result.error || 'Errore sconosciuto' })
        setAdvancedMode(false)
      } else {
        setStatus(result)
      }
    } catch (err: any) {
      setStatus({ ready: false, loading: false, error: err.message })
      setAdvancedMode(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-navy-900 rounded-2xl shadow-elevated border border-navy-700/40 max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700/40">
          <h2 className="text-lg font-bold text-white">Impostazioni</h2>
          <button onClick={onClose} className="text-navy-500 hover:text-navy-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <Section title="Modalit&agrave; avanzata NER">
            <p className="text-sm text-navy-300 leading-relaxed mb-4">
              Attiva un terzo modello NER multilingue
              (<code className="text-accent-300 text-xs">distilbert-base-multilingual-cased-ner-hrl</code>)
              che si aggiunge ai due modelli base per migliorare il riconoscimento delle entit&agrave; in
              documenti misti (italiano + altre lingue) e aumentare la confidenza tramite consenso a tre vie.
            </p>

            <div className="bg-navy-800/60 rounded-lg p-4 mb-4 border border-navy-700/30">
              <div className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div className="text-xs text-navy-300 leading-relaxed">
                  <strong className="text-amber-300">Attenzione</strong>: il modello richiede uno scaricamento
                  iniziale di <strong className="text-white">~270 MB</strong> (una sola volta) e
                  utilizza pi&ugrave; memoria RAM durante l'analisi.
                  <br />Supporta 10 lingue (italiano, inglese, francese, tedesco, spagnolo, portoghese,
                  arabo, hausa, igbo, yoruba). Lo scaricamento viene riutilizzato in seguito.
                </div>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between bg-navy-800/40 rounded-lg px-4 py-3 border border-navy-700/30">
              <div className="flex-1">
                <p className="text-sm text-navy-100 font-medium">Modalit&agrave; avanzata</p>
                <p className="text-xs text-navy-500 mt-0.5">
                  {status.ready ? (
                    <span className="text-emerald-400">Modello caricato e attivo</span>
                  ) : status.error ? (
                    <span className="text-red-400">Errore: {status.error}</span>
                  ) : busy ? (
                    <span className="text-accent-400">In elaborazione...</span>
                  ) : advancedMode ? (
                    <span className="text-navy-400">Attiva ma non ancora caricata</span>
                  ) : (
                    <span className="text-navy-500">Disattivata</span>
                  )}
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={busy}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  advancedMode ? 'bg-accent-600' : 'bg-navy-700'
                } ${busy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label="Toggle advanced mode"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    advancedMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Progress bar during download */}
            {busy && progress && (
              <div className="mt-4">
                <div className="w-full bg-navy-800 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-accent-600 to-accent-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, progress.percent)}%` }}
                  />
                </div>
                <p className="text-xs text-navy-300">{progress.message}</p>
                <p className="text-xs text-navy-500 mt-0.5">{Math.round(progress.percent)}%</p>
              </div>
            )}
          </Section>
        </div>

        <div className="px-6 py-3 border-t border-navy-700/40 text-right">
          <button
            onClick={onClose}
            className="bg-accent-600 hover:bg-accent-500 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-accent-300 mb-2">{title}</h3>
      {children}
    </div>
  )
}
