/**
 * Safe localStorage wrapper that handles cases when storage access is blocked
 * by browser Tracking Prevention (e.g. Microsoft Edge, Safari ITP).
 * Falls back to an in-memory store so the app continues to function.
 */

// In-memory fallback used when localStorage is unavailable
const memoryStorage = new Map<string, string>()

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__tf_storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Evaluate once and cache the result
const _localStorageAvailable: boolean = isLocalStorageAvailable()

if (!_localStorageAvailable) {
  console.warn('[TourFurr] localStorage blocked by browser privacy settings. Using in-memory storage - session will not persist across page reloads.')
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (_localStorageAvailable) {
      try {
        return localStorage.getItem(key)
      } catch {
        // fall through to memory
      }
    }
    return memoryStorage.get(key) ?? null
  },

  setItem(key: string, value: string): void {
    if (_localStorageAvailable) {
      try {
        localStorage.setItem(key, value)
        return
      } catch {
        // fall through to memory
      }
    }
    memoryStorage.set(key, value)
  },

  removeItem(key: string): void {
    if (_localStorageAvailable) {
      try {
        localStorage.removeItem(key)
        return
      } catch {
        // fall through to memory
      }
    }
    memoryStorage.delete(key)
  }
}
