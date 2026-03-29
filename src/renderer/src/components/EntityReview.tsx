import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import { Entity, EntityType } from '../../../shared/types'
import AddEntityModal from './AddEntityModal'
import CustomWordsPanel from './CustomWordsPanel'

const TYPE_COLORS: Record<EntityType, string> = {
  PERSONA: 'bg-purple-900/30 text-purple-300 border-purple-700/40',
  ORGANIZZAZIONE: 'bg-blue-900/30 text-blue-300 border-blue-700/40',
  LUOGO: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
  CODICE_FISCALE: 'bg-orange-900/30 text-orange-300 border-orange-700/40',
  PARTITA_IVA: 'bg-amber-900/30 text-amber-300 border-amber-700/40',
  IBAN: 'bg-red-900/30 text-red-300 border-red-700/40',
  EMAIL: 'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
  TELEFONO: 'bg-teal-900/30 text-teal-300 border-teal-700/40',
  DATA_NASCITA: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/40',
  INDIRIZZO: 'bg-lime-900/30 text-lime-300 border-lime-700/40',
  NUMERO_DOCUMENTO: 'bg-rose-900/30 text-rose-300 border-rose-700/40'
}

const TYPE_LABELS: Record<EntityType, string> = {
  PERSONA: 'Persona',
  ORGANIZZAZIONE: 'Organizzazione',
  LUOGO: 'Luogo',
  CODICE_FISCALE: 'Codice Fiscale',
  PARTITA_IVA: 'Partita IVA',
  IBAN: 'IBAN',
  EMAIL: 'Email',
  TELEFONO: 'Telefono',
  DATA_NASCITA: 'Data di Nascita',
  INDIRIZZO: 'Indirizzo',
  NUMERO_DOCUMENTO: 'Nr. Documento'
}

export default function EntityReview() {
  const {
    entities, updateEntity, removeEntity,
    document, dictionary, setScreen, setError,
    setOutputPath, setReplacementCount,
    outputDir, setOutputDir
  } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCustomWords, setShowCustomWords] = useState(false)
  const [filter, setFilter] = useState<EntityType | 'all'>('all')

  const filteredEntities = filter === 'all'
    ? entities
    : entities.filter(e => e.type === filter)

  const confirmedCount = entities.filter(e => e.confirmed).length

  // Set default output dir to same folder as source file
  React.useEffect(() => {
    if (document && !outputDir) {
      window.api.getFileDir(document.filePath).then(dir => setOutputDir(dir))
    }
  }, [document, outputDir, setOutputDir])

  const handleChangeOutputDir = async () => {
    const dir = await window.api.selectOutputDir()
    if (dir) setOutputDir(dir)
  }

  const handleAnonymize = async () => {
    if (confirmedCount === 0) {
      setError('Conferma almeno un\'entit\u00e0 da anonimizzare')
      return
    }

    const dir = outputDir || await window.api.selectOutputDir()
    if (!dir) return

    setScreen('anonymizing')

    try {
      const result = await window.api.anonymizeDocument(
        document!.filePath,
        entities.filter(e => e.confirmed),
        dir
      )

      if (result.success) {
        setOutputPath(result.data.outputPath)
        setReplacementCount(confirmedCount)
        setScreen('success')
      } else {
        setError(result.error)
        setScreen('entity-review')
      }
    } catch (err: any) {
      setError(err.message)
      setScreen('entity-review')
    }
  }

  const handleExportDict = async () => {
    await window.api.exportDictionary(dictionary)
  }

  const typeCounts = entities.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Revisione Entit&agrave;</h2>
          <p className="text-sm text-navy-400 mt-1">
            {document?.fileName} &mdash; {entities.length} entit&agrave; trovate, {confirmedCount} confermate
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCustomWords(true)}
            className="bg-navy-800 hover:bg-navy-700 text-navy-200 px-3 py-2 rounded-lg text-sm font-medium border border-navy-600 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
            </svg>
            Parole personalizzate
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-navy-800 hover:bg-navy-700 text-navy-200 px-3 py-2 rounded-lg text-sm font-medium border border-navy-600 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Aggiungi entit&agrave;
          </button>
          <button
            onClick={handleExportDict}
            className="bg-navy-800 hover:bg-navy-700 text-navy-200 px-3 py-2 rounded-lg text-sm font-medium border border-navy-600 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Esporta dizionario
          </button>
          <button
            onClick={handleAnonymize}
            className="bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-500 hover:to-accent-600 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg shadow-accent-600/20"
          >
            Anonimizza documento
          </button>
        </div>
      </div>

      {/* Output directory bar */}
      <div className="bg-navy-900/40 rounded-lg px-4 py-3 mb-5 flex items-center justify-between border border-navy-700/30">
        <div className="flex items-center gap-3 min-w-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#627d98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <div className="min-w-0">
            <span className="text-xs text-navy-500 block">Cartella di output</span>
            <span className="text-sm text-navy-200 font-mono truncate block">{outputDir || 'Non selezionata'}</span>
          </div>
        </div>
        <button
          onClick={handleChangeOutputDir}
          className="text-xs text-accent-400 hover:text-accent-300 font-medium flex-shrink-0 ml-4"
        >
          Cambia
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-accent-600 text-white'
              : 'bg-navy-800 text-navy-300 hover:bg-navy-700 border border-navy-700/50'
          }`}
        >
          Tutte ({entities.length})
        </button>
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setFilter(type as EntityType)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === type
                ? 'bg-accent-600 text-white'
                : 'bg-navy-800 text-navy-300 hover:bg-navy-700 border border-navy-700/50'
            }`}
          >
            {TYPE_LABELS[type as EntityType]} ({count})
          </button>
        ))}
      </div>

      {/* Entity table */}
      <div className="bg-navy-900/60 backdrop-blur-sm rounded-xl border border-navy-700/40 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-navy-800/60 border-b border-navy-700/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={filteredEntities.length > 0 && filteredEntities.every(e => e.confirmed)}
                  onChange={(e) => {
                    filteredEntities.forEach(entity => {
                      updateEntity(entity.id, { confirmed: e.target.checked })
                    })
                  }}
                  className="rounded bg-navy-700 border-navy-600"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Testo originale</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider">Pseudonimo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider w-16">Occ.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-navy-400 uppercase tracking-wider w-20">Fonte</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredEntities.map((entity) => (
              <EntityRow
                key={entity.id}
                entity={entity}
                onUpdate={(updates) => updateEntity(entity.id, updates)}
                onRemove={() => removeEntity(entity.id)}
              />
            ))}
            {filteredEntities.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-navy-500">
                  Nessuna entit&agrave; trovata
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Back */}
      <div className="mt-6 text-center">
        <button
          onClick={() => { useStore.getState().reset(); setScreen('dropzone') }}
          className="text-sm text-navy-500 hover:text-navy-300 transition-colors"
        >
          &larr; Torna alla selezione file
        </button>
      </div>

      {showAddModal && <AddEntityModal onClose={() => setShowAddModal(false)} />}
      {showCustomWords && <CustomWordsPanel onClose={() => setShowCustomWords(false)} />}
    </div>
  )
}

function EntityRow({
  entity,
  onUpdate,
  onRemove
}: {
  entity: Entity
  onUpdate: (updates: Partial<Entity>) => void
  onRemove: () => void
}) {
  const [editingPseudonym, setEditingPseudonym] = useState(false)
  const [pseudonymValue, setPseudonymValue] = useState(entity.pseudonym)

  return (
    <tr className={`border-b border-navy-800/60 hover:bg-navy-800/30 transition-colors ${
      !entity.confirmed ? 'opacity-40' : ''
    }`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={entity.confirmed}
          onChange={(e) => onUpdate({ confirmed: e.target.checked })}
          className="rounded bg-navy-700 border-navy-600"
        />
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${TYPE_COLORS[entity.type]}`}>
          {TYPE_LABELS[entity.type]}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-navy-100">{entity.text}</td>
      <td className="px-4 py-3">
        {editingPseudonym ? (
          <input
            type="text"
            value={pseudonymValue}
            onChange={(e) => setPseudonymValue(e.target.value)}
            onBlur={() => { onUpdate({ pseudonym: pseudonymValue }); setEditingPseudonym(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onUpdate({ pseudonym: pseudonymValue }); setEditingPseudonym(false) } }}
            className="bg-navy-800 border border-accent-500/50 rounded px-2 py-1 text-sm text-navy-100 w-full focus:outline-none focus:ring-1 focus:ring-accent-500"
            autoFocus
          />
        ) : (
          <span
            className="text-sm text-accent-300 cursor-pointer hover:text-accent-200 hover:underline"
            onClick={() => setEditingPseudonym(true)}
          >
            {entity.pseudonym}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-navy-400 text-center">{entity.occurrences}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          entity.source === 'regex' ? 'bg-amber-900/30 text-amber-300 border border-amber-800/30' :
          entity.source === 'ner' ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-800/30' :
          'bg-navy-800 text-navy-300 border border-navy-700/50'
        }`}>
          {entity.source === 'regex' ? 'Regex' : entity.source === 'ner' ? 'NER' : 'Manuale'}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onRemove}
          className="text-navy-600 hover:text-red-400 transition-colors"
          title="Rimuovi"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </td>
    </tr>
  )
}
