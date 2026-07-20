export const getSpeechRecognitionConstructor = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null

export const isSpeechRecognitionSupported = () => Boolean(getSpeechRecognitionConstructor())

export const createSpeechRecognition = ({ language, onResult, onError, onEnd, onStart }) => {
  const SpeechRecognition = getSpeechRecognitionConstructor()

  if (!SpeechRecognition) {
    throw new Error('Speech recognition is not supported in this browser.')
  }

  const recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = language

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript ?? ''
    onResult?.(transcript)
  }
  recognition.onerror = (event) => onError?.(event.error)
  recognition.onend = () => onEnd?.()
  recognition.onstart = () => onStart?.()

  return recognition
}
