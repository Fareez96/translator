const DEFAULT_ENDPOINT =
  import.meta.env.VITE_TRANSLATE_API_URL ?? 'https://translate.argosopentech.com/translate'

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

const clients = {
  libre: new LibreTranslateClient(),
}

export const createTranslationClient = (provider = 'libre') => {
  const client = clients[provider]
  if (!client) {
    throw new Error(`Unsupported translation provider: ${provider}`)
  }
  return client
}

export const translateText = ({ text, source, target, provider = 'libre' }) => {
  const client = createTranslationClient(provider)
  return client.translate(text, source, target)
}
