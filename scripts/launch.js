// Remove ELECTRON_RUN_AS_NODE before launching electron-vite
// This variable is set by VS Code/Claude Code and prevents Electron from initializing properly
delete process.env.ELECTRON_RUN_AS_NODE

const { execSync } = require('child_process')
const args = process.argv.slice(2).join(' ')
try {
  execSync(`npx electron-vite ${args}`, {
    stdio: 'inherit',
    env: { ...process.env }
  })
} catch (e) {
  process.exit(e.status || 1)
}
