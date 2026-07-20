import { LANGUAGES } from '../types/languages'

export const isSpeechSynthesisSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

const FALLBACK_LOCALE = 'en-US'

const resolveLocale = (languageCode) => {
  if (languageCode === 'romaji') return LANGUAGES.ja.speechLocale

  return LANGUAGES[languageCode]?.speechLocale ?? FALLBACK_LOCALE
}

export const resolveVoice = (languageCode) => {
  if (!isSpeechSynthesisSupported()) return null

  const locale = resolveLocale(languageCode)
  const voices = window.speechSynthesis.getVoices()

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith(locale.toLowerCase())) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(locale.split('-')[0].toLowerCase())) ||
    voices.find((voice) => voice.default) ||
    null
  )
}

export const speak = ({ text, languageCode, onStart, onEnd, onError }) => {
  if (!isSpeechSynthesisSupported()) {
    throw new Error('Speech synthesis is not supported in this browser.')
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = resolveVoice(languageCode)
  const locale = resolveLocale(languageCode)

  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else {
    utterance.lang = locale
  }

  utterance.onstart = () => onStart?.()
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onError?.(new Error('Unable to play audio output.'))

  window.speechSynthesis.speak(utterance)
  return utterance
}

export const pauseSpeech = () => {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause()
  }
}

export const resumeSpeech = () => {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume()
  }
}

export const stopSpeech = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel()
  }
}
