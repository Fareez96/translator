const DEFAULT_ENDPOINT = import.meta.env.VITE_TRANSLATE_API_URL ?? 'https://libretranslate.com/translate'
const DEFAULT_FALLBACK_ENDPOINT = 'https://api.mymemory.translated.net/get'
const DEFAULT_PROVIDER = import.meta.env.VITE_TRANSLATE_PROVIDER ?? (import.meta.env.VITE_TRANSLATE_API_KEY ? 'libre' : 'mymemory')
const DEFAULT_API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY ?? ''

class LibreTranslateClient {
  constructor(endpoint = DEFAULT_ENDPOINT, apiKey = DEFAULT_API_KEY) {
    this.endpoint = endpoint
    this.apiKey = apiKey
  }

  async translate(text, source, target) {
    const body = {
      q: text,
      source,
      target,
      format: 'text',
    }

    if (this.apiKey) {
      body.api_key = this.apiKey
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (!this.apiKey) {
        throw new Error('Translation API key is missing. Set VITE_TRANSLATE_API_KEY and redeploy.')
      }

      throw new Error('Translation service failed. Please try again.')
    }

    const payload = await response.json()

    const translatedText = payload.translatedText ?? payload.translation ?? payload?.responseData?.translatedText

    if (!translatedText) {
      throw new Error('No translation returned by API.')
    }

    return translatedText
  }
}

class MyMemoryClient {
  constructor(endpoint = DEFAULT_FALLBACK_ENDPOINT) {
    this.endpoint = endpoint
  }

  async translate(text, source, target) {
    const url = new URL(this.endpoint)
    url.searchParams.set('q', text)
    url.searchParams.set('langpair', `${source}|${target}`)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error('Translation service failed. Please try again.')
    }

    const payload = await response.json()
    const translatedText = payload?.responseData?.translatedText

    if (!translatedText) {
      throw new Error('No translation returned by API.')
    }

    return translatedText
  }
}

const clients = {
  libre: new LibreTranslateClient(),
  mymemory: new MyMemoryClient(),
}

export const createTranslationClient = (provider = 'libre') => {
  const client = clients[provider]
  if (!client) {
    throw new Error(`Unsupported translation provider: ${provider}`)
  }
  return client
}

export const translateText = ({ text, source, target, provider = DEFAULT_PROVIDER }) => {
  const client = createTranslationClient(provider)
  return client.translate(text, source, target)
}
