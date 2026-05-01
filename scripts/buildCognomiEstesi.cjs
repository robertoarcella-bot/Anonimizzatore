// Build src/main/services/cognomiEstesi.ts from cognomi_raw.txt
// Source: https://github.com/PaoloSarti/lista_cognomi_italiani (MIT)
const fs = require('fs')
const path = require('path')

const RAW = path.join(__dirname, '..', 'cognomi_raw.txt')
const OUT = path.join(__dirname, '..', 'src', 'main', 'services', 'cognomiEstesi.ts')

const raw = fs.readFileSync(RAW, 'utf-8')
const lines = raw.split(/\r?\n/).map(l => l.trim())

// Normalize: lowercase, keep only entries with letters/spaces/apostrophes, min length 3
const set = new Set()
for (const l of lines) {
  if (l.length < 3) continue
  if (!/^[A-Za-zÀ-ÿ' \-]+$/.test(l)) continue
  set.add(l.toLowerCase())
}

const sorted = [...set].sort()
console.log('Cleaned count:', sorted.length)
console.log('First 5:', sorted.slice(0, 5))
console.log('Last 5:', sorted.slice(-5))

const header = `// Auto-generated. Do not edit by hand.
// Source: https://github.com/PaoloSarti/lista_cognomi_italiani (MIT licence)
// Dataset of common Italian surnames, normalized to lowercase.
// Use only via context-coupled matching (see nerService).
//
// Generated with scripts/buildCognomiEstesi.cjs
//
// Total entries: ${sorted.length}
`

const body = `export const COGNOMI_ESTESI: ReadonlySet<string> = new Set([
${sorted.map(s => '  ' + JSON.stringify(s)).join(',\n')}
])
`

fs.writeFileSync(OUT, header + '\n' + body, 'utf-8')
console.log('Wrote', OUT)
