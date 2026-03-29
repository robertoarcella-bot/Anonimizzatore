import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  onClose: () => void
}

export default function CustomWordsPanel({ onClose }: Props) {
  const { addEntity, document: doc } = useStore()
  const [wordsText, setWordsText] = useState('')
  const [pseudonym, setPseudonym] = useState('[OMISSIS]')
  const [addedCount, setAddedCount] = useState(0)

  const handleAddWords = () => {
    const words = wordsText
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0)

    if (words.length === 0) return

    let count = 0
    for (const word of words) {
      // Check how many times this word appears in the document
      const text = doc?.textContent || ''
      const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      const matches = text.match(regex)
      const occurrences = matches ? matches.length : 0

      addEntity({
        id: uuidv4(),
        text: word,
        type: 'PERSONA',
        pseudonym: pseudonym || '[OMISSIS]',
        confirmed: true,
        occurrences,
        source: 'manual'
      })
      count++
    }

    setAddedCount(count)
    setWordsText('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-navy-900 rounded-2xl p-6 shadow-elevated border border-navy-700/40 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Parole personalizzate</h3>
          <button onClick={onClose} className="text-navy-500 hover:text-navy-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <p className="text-sm text-navy-400 mb-4">
          Inserisci parole o frasi specifiche da anonimizzare, una per riga.
          Verranno sostituite con lo pseudonimo indicato.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1.5">
              Parole da anonimizzare (una per riga)
            </label>
            <textarea
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              placeholder={"es.\nMario Rossi\nVia Roma 15\nAzienda XYZ S.r.l."}
              rows={6}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-navy-100 placeholder-navy-600 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 resize-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1.5">
              Sostituisci con
            </label>
            <input
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              placeholder="[OMISSIS]"
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-navy-100 placeholder-navy-600 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
            />
            <p className="text-xs text-navy-500 mt-1">
              Tutte le parole inserite verranno sostituite con questo testo
            </p>
          </div>
        </div>

        {addedCount > 0 && (
          <div className="mt-4 bg-emerald-900/20 border border-emerald-700/30 rounded-lg px-3 py-2">
            <p className="text-sm text-emerald-300">
              {addedCount} {addedCount === 1 ? 'parola aggiunta' : 'parole aggiunte'} alla lista
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-navy-400 hover:text-navy-200 hover:bg-navy-800 rounded-lg transition-colors"
          >
            Chiudi
          </button>
          <button
            onClick={handleAddWords}
            disabled={!wordsText.trim()}
            className="px-4 py-2 text-sm bg-accent-600 hover:bg-accent-500 text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Aggiungi alla lista
          </button>
        </div>
      </div>
    </div>
  )
}
