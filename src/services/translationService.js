const DEFAULT_ENDPOINT = import.meta.env.VITE_TRANSLATE_API_URL ?? 'https://libretranslate.com/translate'
const DEFAULT_FALLBACK_ENDPOINT = 'https://api.mymemory.translated.net/get'
const DEFAULT_NVIDIA_ENDPOINT =
  import.meta.env.VITE_NVIDIA_API_URL ?? 'https://integrate.api.nvidia.com/v1/chat/completions'
const DEFAULT_NVIDIA_MODEL = import.meta.env.VITE_NVIDIA_MODEL ?? 'meta/llama-3.1-8b-instruct'
const DEFAULT_PROVIDER =
  import.meta.env.VITE_TRANSLATE_PROVIDER ??
  (import.meta.env.VITE_NVIDIA_API_KEY
    ? 'nvidia'
    : import.meta.env.VITE_TRANSLATE_API_KEY
      ? 'libre'
      : 'mymemory')
const DEFAULT_API_KEY = import.meta.env.VITE_TRANSLATE_API_KEY ?? ''
const DEFAULT_NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY ?? ''

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

class NvidiaClient {
  constructor(endpoint = DEFAULT_NVIDIA_ENDPOINT, apiKey = DEFAULT_NVIDIA_API_KEY, model = DEFAULT_NVIDIA_MODEL) {
    this.endpoint = endpoint
    this.apiKey = apiKey
    this.model = model
  }

  async translate(text, source, target) {
    const isRomajiMode = source === 'romaji' || target === 'romaji'
    const prompt = isRomajiMode
      ? target === 'romaji'
        ? `Transliterate the following Japanese text into Romanji (Latin letters). Return only the Romanji output and no extra commentary.\n\n${text}`
        : `Convert the following Romanji (Latin letters) into natural Japanese text. Return only the Japanese output and no extra commentary.\n\n${text}`
      : `Translate the following text from ${source} to ${target}. Return only the translated text and no extra commentary.\n\n${text}`

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          max_tokens: 1024,
          messages: [
            {
              role: 'system',
              content:
                isRomajiMode
                  ? 'You are a precise transliteration engine. Return only the requested Romanji or Japanese output and no extra commentary.'
                  : 'You are a precise translation engine. Return only the translated text and no extra commentary.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '')

        if (!this.apiKey) {
          throw new Error('NVIDIA API key is missing. Set NWWW in GitHub Actions and redeploy.')
        }

        throw new Error(
          `NVIDIA translation failed (${response.status} ${response.statusText})${errorBody ? `: ${errorBody}` : ''}`,
        )
      }

      const payload = await response.json()
      const translatedText =
        payload?.choices?.[0]?.message?.content?.trim() ?? payload?.choices?.[0]?.text?.trim()

      if (!translatedText) {
        throw new Error('No translation returned by NVIDIA.')
      }

      return translatedText
    } catch (error) {
      if (isRomajiMode) {
        throw error
      }

      const fallbackClient = clients.mymemory

      if (!fallbackClient) {
        throw error
      }

      try {
        return await fallbackClient.translate(text, source, target)
      } catch {
        throw error
      }
    }
  }
}

const clients = {
  nvidia: new NvidiaClient(),
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
