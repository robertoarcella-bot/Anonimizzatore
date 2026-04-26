import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

export interface AppSettings {
  advancedMode: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  advancedMode: false
}

function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function loadSettings(): AppSettings {
  try {
    const path = getSettingsPath()
    if (!existsSync(path)) return { ...DEFAULT_SETTINGS }
    const raw = readFileSync(path, 'utf-8')
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = loadSettings()
  const updated = { ...current, ...settings }
  try {
    writeFileSync(getSettingsPath(), JSON.stringify(updated, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
  return updated
}
