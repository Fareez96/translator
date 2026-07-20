import { useCallback, useEffect, useState } from 'react'
import {
  getAvailableVoices,
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
  const [voices, setVoices] = useState([])

  const refreshVoices = useCallback(() => {
    setVoices(getAvailableVoices())
  }, [])

  useEffect(() => {
    refreshVoices()

    if (!isSpeechSynthesisSupported()) return undefined

    const handleVoicesChanged = () => refreshVoices()

    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
      }
    }

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [refreshVoices])

  const speakText = ({ text, languageCode, voiceURI }) => {
    if (!text.trim()) {
      setError('No translated text available to speak.')
      return
    }

    try {
      setError('')
      speak({
        text,
        languageCode,
        voiceURI,
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
    voices,
    refreshVoices,
    speakText,
    pause,
    resume,
    stop,
  }
}
