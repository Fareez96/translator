import { useRef, useState } from 'react'
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
} from '../services/speechRecognitionService'

const formatRecognitionError = (error) => {
  if (error === 'not-allowed') return 'Microphone permission denied.'
  if (error === 'no-speech') return 'No speech detected. Please try again.'
  if (error === 'audio-capture') return 'No microphone was found.'
  return 'Speech recognition failed. Please try again.'
}

export const useSpeechRecognition = ({ onTranscript }) => {
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')

  const startListening = (language) => {
    if (!isSpeechRecognitionSupported()) {
      setError('Speech recognition is unavailable in this browser.')
      return
    }

    setError('')
    recognitionRef.current?.stop()

    recognitionRef.current = createSpeechRecognition({
      language,
      onStart: () => setIsListening(true),
      onEnd: () => setIsListening(false),
      onResult: (text, isFinal) => {
        if (text) {
          onTranscript?.(text, isFinal)
        }
      },
      onError: (recognitionError) => {
        setError(formatRecognitionError(recognitionError))
      },
    })

    recognitionRef.current.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  return {
    supported: isSpeechRecognitionSupported(),
    isListening,
    error,
    clearError: () => setError(''),
    startListening,
    stopListening,
  }
}
