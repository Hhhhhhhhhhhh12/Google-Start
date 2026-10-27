type KeyStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export const API_KEY_STORAGE_KEY = 'serper_api_key'

export function loadApiKey(session?: KeyStore, persistent?: KeyStore): { key: string; remembered: boolean; error: string | null } {
  try {
    const sessionKey = (session ?? sessionStorage).getItem(API_KEY_STORAGE_KEY)
    const storedKey = (persistent ?? localStorage).getItem(API_KEY_STORAGE_KEY)
    return { key: sessionKey ?? storedKey ?? '', remembered: !!storedKey && !sessionKey, error: null }
  } catch {
    return { key: '', remembered: false, error: 'Schlüsselablage nicht verfügbar. Externe Recherche bleibt deaktiviert.' }
  }
}

export function saveApiKey(key: string, remember: boolean, session?: KeyStore, persistent?: KeyStore): string | null {
  try {
    const sessionStore = session ?? sessionStorage
    const persistentStore = persistent ?? localStorage
    // Remove a former permanent copy before selecting a shorter retention period.
    persistentStore.removeItem(API_KEY_STORAGE_KEY)
    sessionStore.removeItem(API_KEY_STORAGE_KEY)
    if (key.trim()) (remember ? persistentStore : sessionStore).setItem(API_KEY_STORAGE_KEY, key.trim())
    return null
  } catch {
    return 'Der Schlüssel konnte nicht wie gewünscht gespeichert werden. Bitte die Browserberechtigungen prüfen; die Ablage wurde möglicherweise nur teilweise geändert.'
  }
}

export function deleteApiKey(session?: KeyStore, persistent?: KeyStore): string | null {
  let failed = false
  try { (session ?? sessionStorage).removeItem(API_KEY_STORAGE_KEY) } catch { failed = true }
  try { (persistent ?? localStorage).removeItem(API_KEY_STORAGE_KEY) } catch { failed = true }
  return failed ? 'Der Schlüssel wurde im Formular entfernt, konnte aber nicht aus allen Browserablagen gelöscht werden. Bitte die Browserberechtigungen prüfen und erneut löschen.' : null
}
