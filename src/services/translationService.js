const DEFAULT_ENDPOINT =
  import.meta.env.VITE_TRANSLATE_API_URL ?? 'https://translate.argosopentech.com/translate'

const DEFAULT_FALLBACK_ENDPOINT = 'https://api.mymemory.translated.net/get'

class LibreTranslateClient {
  constructor(endpoint = DEFAULT_ENDPOINT) {
    this.endpoint = endpoint
  }

  async translate(text, source, target) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: 'text',
      }),
    })

    if (!response.ok) {
      throw new Error('Translation service failed. Please try again.')
    }

    const payload = await response.json()

    if (!payload.translatedText) {
      throw new Error('No translation returned by API.')
    }

    return payload.translatedText
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

export const translateText = ({ text, source, target, provider = 'mymemory' }) => {
  const client = createTranslationClient(provider)
  return client.translate(text, source, target)
}
