import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import type { AppSettings } from '../../shared/types'

const SETTINGS_FILE = join(app.getPath('userData'), 'settings.json')

const defaults: AppSettings = {
  downloadPath: join(app.getPath('downloads'), 'Cerberus'),
  tmdbApiKey: '',
  externalPlayerPath: ''
}

let cache: AppSettings | null = null

function load(): AppSettings {
  if (cache) return cache
  if (existsSync(SETTINGS_FILE)) {
    try {
      cache = { ...defaults, ...JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8')) }
    } catch {
      cache = { ...defaults }
    }
  } else {
    cache = { ...defaults }
  }
  return cache!
}

export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return load()[key]
}

export function setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
  const settings = load()
  settings[key] = value
  cache = settings
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

export function getAllSettings(): AppSettings {
  return { ...load() }
}
