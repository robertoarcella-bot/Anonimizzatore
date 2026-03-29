# Anonimizzatore

Software desktop per la **pseudo-anonimizzazione** di sentenze, ordinanze e atti legali italiani.

Identifica automaticamente i dati personali presenti nel documento (nomi, codici fiscali, IBAN, indirizzi, ecc.) e li sostituisce con etichette non riconducibili come `[PERSONA_1]`, `[CF_1]`, `[LUOGO_1]`.

**100% offline** — Nessun dato lascia il computer. Conforme al GDPR.

---

## Caratteristiche

- **Riconoscimento automatico delle entità (NER)** tramite tre livelli di analisi:
  - Pattern regex per codici fiscali, P.IVA, IBAN, email, telefoni, indirizzi, date
  - Dizionario di oltre 400 nomi e cognomi italiani con riconoscimento contestuale
  - Modello AI (DistilBERT via Transformers.js) per persone, organizzazioni e luoghi
- **Pseudonimi chiaramente identificabili**: `[PERSONA_1]`, `[ORG_2]`, `[CF_3]` — impossibili da confondere con dati reali
- **Formati supportati**: PDF, DOCX, TXT
- **Output PDF sicuro**: il documento viene ricostruito da zero — nessun dato originale rimane nel file
- **Revisione manuale**: conferma, modifica, rimuovi o aggiungi entità prima dell'anonimizzazione
- **Parole personalizzate**: aggiungi manualmente parole o frasi specifiche da anonimizzare
- **Dizionario esportabile/importabile**: mantieni gli stessi pseudonimi tra documenti correlati
- **Interfaccia professionale** in italiano con tema scuro
- **Guida integrata** accessibile dal menu Aiuto (F1)

## Installazione

### Windows

Scarica l'installer dalla sezione [Releases](../../releases):

> **Anonimizzatore Setup 1.1.0.exe**

Esegui il file e segui la procedura guidata. Verrà creato un collegamento sul desktop e nel menu Start.

### macOS

Scarica il DMG dalla sezione [Releases](../../releases):

> **Anonimizzatore-1.1.0.dmg**

Apri il DMG e trascina l'applicazione nella cartella Applicazioni.

### Da sorgente

```bash
git clone https://github.com/robertoarcella-bot/Anonimizzatore.git
cd Anonimizzatore
npm ci
npm run dev        # Avvia in modalità sviluppo
npm run package    # Crea l'installer per la piattaforma corrente
```

## Come funziona

1. **Carica il documento** — Trascina un file PDF, DOCX o TXT nella zona di caricamento, oppure clicca per selezionarlo
2. **Analisi automatica** — Il software identifica i dati personali con tre metodi complementari: pattern regex, dizionario nomi italiani e modello AI
3. **Revisione** — Esamina le entità trovate, modifica gli pseudonimi, rimuovi i falsi positivi, aggiungi parole personalizzate
4. **Anonimizzazione** — Il documento viene generato con tutti i dati personali sostituiti da pseudonimi univoci

## Entità riconosciute

| Tipo | Esempio | Pseudonimo |
|------|---------|------------|
| Persona | Mario Rossi | `[PERSONA_1]` |
| Organizzazione | Alfa S.r.l. | `[ORG_1]` |
| Luogo | Milano | `[LUOGO_1]` |
| Codice Fiscale | RSSMRA85M01H501Z | `[CF_1]` |
| Partita IVA | 01234567890 | `[PIVA_1]` |
| IBAN | IT60X0542811101000000123456 | `[IBAN_1]` |
| Email | mario@esempio.it | `[EMAIL_1]` |
| Telefono | +39 06 12345678 | `[TEL_1]` |
| Data di nascita | 01/01/1985 | `[DATA_1]` |
| Indirizzo | Via Roma, 15 | `[INDIRIZZO_1]` |

## Sicurezza dell'output

Per i documenti **PDF**, l'output viene **ricostruito completamente da zero**: ogni frammento di testo viene estratto con le sue coordinate originali, le entità vengono sostituite, e un nuovo PDF viene generato posizionando il testo anonimizzato alle stesse coordinate. Il testo originale non è presente in nessun livello del file (content stream, metadati, layer nascosti).

Per i documenti **DOCX**, le entità vengono sostituite direttamente nel contenuto XML interno al file Word preservando la formattazione.

Per i file **TXT**, la sostituzione avviene direttamente nel testo.

## Riduzione dei falsi positivi

Il software include una serie di meccanismi per ridurre i falsi positivi:

- **Blocklist di termini legali**: oltre 200 parole del lessico giuridico (ordinanza, ricorrente, subordinata, ecc.) che non vengono mai scambiate per nomi di persona
- **Filtraggio contestuale per "via"**: il termine "via" viene riconosciuto come indirizzo solo quando è capitalizzato ("Via") e seguito da un nome proprio, escludendo espressioni come "via subordinata", "via equitativa", "via istruttoria"
- **"Corso" e "strada"** richiedono un numero civico per essere considerati indirizzi
- **Deduplicazione intelligente**: nomi con le stesse parole in ordine diverso (es. "Rossi Mario" e "Mario Rossi") vengono unificati

## Stack tecnologico

| Componente | Tecnologia |
|-----------|-----------|
| Desktop | Electron 33 |
| Frontend | React 18, TypeScript, Tailwind CSS |
| Stato | Zustand |
| NER / AI | Transformers.js (ONNX), @xenova/transformers |
| PDF parsing | pdf-parse |
| PDF output | pdf-lib, pdfjs-dist |
| DOCX | Mammoth, adm-zip |
| Build | electron-vite, electron-builder |

## Credits

**Autore**: [Avv. Roberto Arcella](https://github.com/robertoarcella-bot/Anonimizzatore)

Fork del progetto [Anonimator](https://github.com/avvocati-e-mac/anonimator) dell'Avv. Filippo Strozzi, realizzata in collaborazione con il **Laboratorio Avvocati e Magistrati del Distretto della Corte d'Appello di Napoli**.

## Licenza

MIT
