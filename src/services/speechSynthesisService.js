import { LANGUAGES } from '../types/languages'

export const isSpeechSynthesisSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

export const getAvailableVoices = () => {
  if (!isSpeechSynthesisSupported()) return []

  return window.speechSynthesis.getVoices().map((voice) => ({
    default: voice.default,
    lang: voice.lang,
    localService: voice.localService,
    name: voice.name,
    voiceURI: voice.voiceURI,
  }))
}

const FALLBACK_LOCALE = 'en-US'

const resolveLocale = (languageCode) => {
  if (languageCode === 'romaji') return LANGUAGES.ja.speechLocale

  return LANGUAGES[languageCode]?.speechLocale ?? FALLBACK_LOCALE
}

export const resolveVoice = (languageCode, preferredVoiceURI) => {
  if (!isSpeechSynthesisSupported()) return null

  const locale = resolveLocale(languageCode)
  const voices = window.speechSynthesis.getVoices()

  if (preferredVoiceURI) {
    const preferredVoice = voices.find((voice) => voice.voiceURI === preferredVoiceURI)

    if (preferredVoice) {
      return preferredVoice
    }
  }

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith(locale.toLowerCase())) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(locale.split('-')[0].toLowerCase())) ||
    voices.find((voice) => voice.default) ||
    null
  )
}

export const speak = ({ text, languageCode, voiceURI, onStart, onEnd, onError }) => {
  if (!isSpeechSynthesisSupported()) {
    throw new Error('Speech synthesis is not supported in this browser.')
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = resolveVoice(languageCode, voiceURI)
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
