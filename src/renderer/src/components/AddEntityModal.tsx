import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { EntityType } from '../../../shared/types'
import { v4 as uuidv4 } from 'uuid'

const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'PERSONA', label: 'Persona' },
  { value: 'ORGANIZZAZIONE', label: 'Organizzazione' },
  { value: 'LUOGO', label: 'Luogo' },
  { value: 'CODICE_FISCALE', label: 'Codice Fiscale' },
  { value: 'PARTITA_IVA', label: 'Partita IVA' },
  { value: 'IBAN', label: 'IBAN' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'TELEFONO', label: 'Telefono' },
  { value: 'DATA_NASCITA', label: 'Data di Nascita' },
  { value: 'INDIRIZZO', label: 'Indirizzo' },
  { value: 'NUMERO_DOCUMENTO', label: 'Nr. Documento' }
]

interface Props {
  onClose: () => void
}

export default function AddEntityModal({ onClose }: Props) {
  const { addEntity } = useStore()
  const [text, setText] = useState('')
  const [type, setType] = useState<EntityType>('PERSONA')
  const [pseudonym, setPseudonym] = useState('')

  const handleAdd = () => {
    if (!text.trim()) return

    addEntity({
      id: uuidv4(),
      text: text.trim(),
      type,
      pseudonym: pseudonym.trim() || '[OMISSIS]',
      confirmed: true,
      occurrences: 0,
      source: 'manual'
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-navy-900 rounded-2xl p-6 shadow-elevated border border-navy-700/40 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Aggiungi entit&agrave;</h3>
          <button onClick={onClose} className="text-navy-500 hover:text-navy-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1.5">Testo originale</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="es. Mario Rossi"
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-navy-100 placeholder-navy-600 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1.5">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EntityType)}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-navy-100 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
            >
              {ENTITY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1.5">Pseudonimo (opzionale)</label>
            <input
              type="text"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              placeholder="Generato automaticamente se vuoto"
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-navy-100 placeholder-navy-600 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-navy-400 hover:text-navy-200 hover:bg-navy-800 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            className="px-4 py-2 text-sm bg-accent-600 hover:bg-accent-500 text-white rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Aggiungi
          </button>
        </div>
      </div>
    </div>
  )
}
