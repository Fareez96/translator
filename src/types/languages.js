export const LANGUAGES = {
  en: { code: 'en', name: 'English', locale: 'en-US', speechLocale: 'en-US' },
  hi: { code: 'hi', name: 'Hindi', locale: 'hi-IN', speechLocale: 'hi-IN' },
}

export const LANGUAGE_OPTIONS = Object.values(LANGUAGES)

export const DEFAULT_DIRECTION = {
  source: LANGUAGES.en.code,
  target: LANGUAGES.hi.code,
}
