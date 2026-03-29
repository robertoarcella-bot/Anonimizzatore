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

## Screenshot

![Revisione Entità](https://img.shields.io/badge/Schermata-Revisione%20Entit%C3%A0-blue)

## Installazione

### Windows

Scarica l'installer dalla sezione [Releases](../../releases):

> **Anonimizzatore Setup 1.0.0.exe**

Esegui il file e segui la procedura guidata.

### macOS

Scarica il DMG dalla sezione [Releases](../../releases):

> **Anonimizzatore-1.0.0.dmg**

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
2. **Analisi automatica** — Il software identifica i dati personali con regex, dizionari e modello AI
3. **Revisione** — Esamina le entità trovate, modifica gli pseudonimi, aggiungi parole personalizzate
4. **Anonimizzazione** — Il documento viene generato con tutti i dati personali sostituiti

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

## Sicurezza

Per i documenti PDF, l'output viene **ricostruito completamente da zero**: il testo originale non è presente in nessun livello del file (content stream, metadati, layer nascosti). Selezionando e copiando il testo dal PDF anonimizzato si ottengono solo gli pseudonimi.

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
