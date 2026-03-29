import React from 'react'
import { useStore } from '../store/useStore'

export default function ModelStatusBadge() {
  const { modelReady, modelLoading, modelProgress, modelError } = useStore()

  if (modelReady) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/30 border border-emerald-700/30">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-xs text-emerald-300 font-medium">NER attivo</span>
      </div>
    )
  }

  if (modelError) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-900/30 border border-amber-700/30" title={modelError}>
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="text-xs text-amber-300 font-medium">Solo regex</span>
      </div>
    )
  }

  if (modelLoading) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-800 border border-navy-600">
        <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
        <span className="text-xs text-navy-300 font-medium">
          Modello NER {modelProgress > 0 ? `${Math.round(modelProgress)}%` : '...'}
        </span>
      </div>
    )
  }

  return null
}
