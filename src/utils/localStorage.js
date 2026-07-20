export const storage = {
  get(key, fallback) {
    try {
      const value = window.localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage failures
    }
  },
}
