import React from 'react'

interface Props {
  onClose: () => void
}

export default function GuideModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-navy-900 rounded-2xl shadow-elevated border border-navy-700/40 max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700/40">
          <h2 className="text-lg font-bold text-white">Guida all'uso</h2>
          <button onClick={onClose} className="text-navy-500 hover:text-navy-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto text-sm text-navy-200 leading-relaxed space-y-5">

          <Section title="Cos'&egrave; l'Anonimizzatore">
            <p>
              L'Anonimizzatore &egrave; un software desktop per la <strong className="text-white">pseudo-anonimizzazione</strong> di
              sentenze, ordinanze e atti legali. Identifica automaticamente i dati personali
              (nomi, codici fiscali, indirizzi, ecc.) e li sostituisce con etichette non
              riconducibili come <code className="text-accent-300">[PERSONA_1]</code>, <code className="text-accent-300">[CF_1]</code>, ecc.
            </p>
            <p className="text-navy-400 mt-2">
              Tutti i dati vengono elaborati localmente sul tuo computer. Nessuna informazione
              viene inviata a server esterni. Il software &egrave; conforme al GDPR.
            </p>
          </Section>

          <Section title="Formati supportati">
            <ul className="list-disc list-inside space-y-1 text-navy-300">
              <li><strong className="text-white">PDF</strong> &mdash; Il documento viene ricostruito da zero con gli pseudonimi al posto dei dati personali. Nessun testo originale rimane nel file.</li>
              <li><strong className="text-white">DOCX</strong> &mdash; Le entit&agrave; vengono sostituite direttamente nel contenuto XML del documento Word.</li>
              <li><strong className="text-white">TXT</strong> &mdash; Sostituzione diretta nel testo.</li>
            </ul>
          </Section>

          <Section title="Come funziona">
            <ol className="list-decimal list-inside space-y-2 text-navy-300">
              <li>
                <strong className="text-white">Carica il documento</strong> &mdash; Trascina un file nella zona di caricamento oppure clicca per selezionarlo dal computer.
              </li>
              <li>
                <strong className="text-white">Analisi automatica</strong> &mdash; Il software analizza il testo con tre metodi:
                <ul className="list-disc list-inside ml-5 mt-1 space-y-0.5 text-navy-400">
                  <li><em>Pattern regex</em> &mdash; Codici fiscali, P.IVA, IBAN, email, telefoni, indirizzi, date</li>
                  <li><em>Dizionario nomi italiani</em> &mdash; Oltre 400 nomi e cognomi comuni</li>
                  <li><em>Modello NER (AI)</em> &mdash; Riconoscimento automatico di persone, organizzazioni e luoghi</li>
                </ul>
              </li>
              <li>
                <strong className="text-white">Revisione entit&agrave;</strong> &mdash; Puoi confermare, modificare, rimuovere o aggiungere manualmente le entit&agrave; trovate prima dell'anonimizzazione.
              </li>
              <li>
                <strong className="text-white">Anonimizzazione</strong> &mdash; Il documento viene generato con tutti i dati personali sostituiti da pseudonimi univoci.
              </li>
            </ol>
          </Section>

          <Section title="Tipi di entit&agrave; riconosciute">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-navy-300">
              <div><code className="text-purple-300">PERSONA</code> &mdash; Nomi e cognomi</div>
              <div><code className="text-blue-300">ORGANIZZAZIONE</code> &mdash; Societ&agrave;, enti</div>
              <div><code className="text-emerald-300">LUOGO</code> &mdash; Citt&agrave;, localit&agrave;</div>
              <div><code className="text-orange-300">CODICE FISCALE</code> &mdash; 16 caratteri</div>
              <div><code className="text-amber-300">PARTITA IVA</code> &mdash; 11 cifre</div>
              <div><code className="text-red-300">IBAN</code> &mdash; Codice bancario</div>
              <div><code className="text-cyan-300">EMAIL</code> &mdash; Indirizzi email</div>
              <div><code className="text-teal-300">TELEFONO</code> &mdash; Numeri di telefono</div>
              <div><code className="text-yellow-300">DATA DI NASCITA</code> &mdash; Date associate</div>
              <div><code className="text-lime-300">INDIRIZZO</code> &mdash; Via, piazza, ecc.</div>
            </div>
          </Section>

          <Section title="Parole personalizzate">
            <p>
              Nella schermata di revisione, il pulsante <strong className="text-white">"Parole personalizzate"</strong> permette
              di aggiungere parole o frasi specifiche da anonimizzare che il sistema non ha
              rilevato automaticamente. Inserisci una parola per riga e scegli lo pseudonimo.
            </p>
          </Section>

          <Section title="Dizionario">
            <p>
              Il dizionario associa ogni entit&agrave; originale al suo pseudonimo. Puoi
              <strong className="text-white"> esportarlo</strong> come file JSON per riutilizzarlo in documenti correlati
              (es. fascicoli della stessa causa) e <strong className="text-white">importarlo</strong> dalla schermata iniziale
              per mantenere gli stessi pseudonimi.
            </p>
          </Section>

          <Section title="Sicurezza dell'output">
            <p>
              Per i file PDF, il documento anonimizzato viene <strong className="text-white">ricostruito completamente da zero</strong>.
              Il testo originale non &egrave; presente in nessun livello del file: n&eacute; nei content stream,
              n&eacute; nei metadati, n&eacute; in layer nascosti. Selezionando e copiando il testo dal PDF
              anonimizzato si otterranno solo gli pseudonimi.
            </p>
          </Section>

          <Section title="Scorciatoie da tastiera">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-navy-300">
              <div><kbd className="text-accent-300">Ctrl+O</kbd> &mdash; Apri documento</div>
              <div><kbd className="text-accent-300">F1</kbd> &mdash; Questa guida</div>
              <div><kbd className="text-accent-300">Ctrl+Q</kbd> &mdash; Esci</div>
            </div>
          </Section>

          <Section title="Credits">
            <p>
              <strong className="text-white">Autore:</strong> Avv. Roberto Arcella
            </p>
            <p className="mt-2">
              Questa applicazione &egrave; un fork del progetto
              <strong className="text-white"> Anonimator</strong> dell'Avv. Filippo Strozzi,
              realizzata in collaborazione con il <strong className="text-white">Laboratorio
              Avvocati e Magistrati del Distretto della Corte d'Appello di Napoli</strong>.
            </p>
          </Section>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-navy-700/40 text-center">
          <button
            onClick={onClose}
            className="bg-accent-600 hover:bg-accent-500 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Ho capito
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
