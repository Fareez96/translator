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
  recognition.interimResults = true
  recognition.maxAlternatives = 1
  recognition.lang = language

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results ?? [])
      .map((result) => result?.[0]?.transcript ?? '')
      .join(' ')
      .trim()

    onResult?.(transcript, event.results?.[event.results.length - 1]?.isFinal ?? false)
  }
  recognition.onerror = (event) => onError?.(event.error)
  recognition.onend = () => onEnd?.()
  recognition.onstart = () => onStart?.()

  return recognition
}
