import { useState } from 'react'
import {
  isSpeechSynthesisSupported,
  pauseSpeech,
  resumeSpeech,
  speak,
  stopSpeech,
} from '../services/speechSynthesisService'

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState('')

  const speakText = ({ text, languageCode }) => {
    if (!text.trim()) {
      setError('No translated text available to speak.')
      return
    }

    try {
      setError('')
      speak({
        text,
        languageCode,
        onStart: () => {
          setIsSpeaking(true)
          setIsPaused(false)
        },
        onEnd: () => {
          setIsSpeaking(false)
          setIsPaused(false)
        },
        onError: (speechError) => {
          setIsSpeaking(false)
          setIsPaused(false)
          setError(speechError.message)
        },
      })
    } catch (speechError) {
      setError(speechError.message)
    }
  }

  const pause = () => {
    pauseSpeech()
    setIsPaused(true)
  }

  const resume = () => {
    resumeSpeech()
    setIsPaused(false)
  }

  const stop = () => {
    stopSpeech()
    setIsSpeaking(false)
    setIsPaused(false)
  }

  return {
    supported: isSpeechSynthesisSupported(),
    isSpeaking,
    isPaused,
    error,
    clearError: () => setError(''),
    speakText,
    pause,
    resume,
    stop,
  }
}
