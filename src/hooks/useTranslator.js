import { useCallback, useState } from 'react'
import { translateText } from '../services/translationService'

export const useTranslator = () => {
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runTranslation = useCallback(async ({ text, source, target }) => {
    const trimmed = text.trim()

    if (!trimmed) {
      setTranslatedText('')
      setError('Please enter text before translating.')
      return ''
    }

    setLoading(true)
    setError('')

    try {
      const result = await translateText({ text: trimmed, source, target })
      setTranslatedText(result)
      return result
    } catch (translationError) {
      const fallback = 'Translation failed. Check your internet and try again.'
      setError(translationError.message || fallback)
      throw translationError
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    translatedText,
    setTranslatedText,
    loading,
    error,
    setError,
    runTranslation,
  }
}
