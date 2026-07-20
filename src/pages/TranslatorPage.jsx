import { AnimatePresence, motion } from 'framer-motion'
import {
  AudioLines,
  Clipboard,
  Eraser,
  FileDown,
  FileUp,
  LoaderCircle,
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  Star,
  Volume2,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import HistoryPanel from '../components/HistoryPanel'
import LanguageSelector from '../components/LanguageSelector'
import VoiceSelector from '../components/VoiceSelector'
import ThemeToggle from '../components/ThemeToggle'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useToast } from '../hooks/useToast'
import { useTranslator } from '../hooks/useTranslator'
import { LANGUAGES, DEFAULT_DIRECTION } from '../types/languages'
import { downloadTextFile, readTextFile } from '../utils/file'
import { countCharacters, countWords } from '../utils/text'

const TranslatorPage = () => {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_DIRECTION.source)
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_DIRECTION.target)
  const [inputText, setInputText] = useState('')
  const [history, setHistory] = useLocalStorage('translator-history', [])
  const [historyQuery, setHistoryQuery] = useState('')
  const [selectedVoiceURI, setSelectedVoiceURI] = useLocalStorage('translator-voice-uri', '')
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  const { translatedText, setTranslatedText, loading, error, runTranslation, setError } = useTranslator()

  const {
    supported: recognitionSupported,
    isListening,
    error: recognitionError,
    startListening,
    stopListening,
    clearError: clearRecognitionError,
  } = useSpeechRecognition({
    onTranscript: async (transcript, isFinal) => {
      setInputText(transcript)
      if (isFinal && transcript.trim()) {
        await handleTranslate(transcript)
      }
    },
  })

  const {
    supported: speechSupported,
    isSpeaking,
    isPaused,
    error: speechError,
    voices,
    refreshVoices,
    speakText,
    pause,
    resume,
    stop,
    clearError: clearSpeechError,
  } = useSpeechSynthesis()

  const feedbackMessage = error || recognitionError || speechError

  async function handleTranslate(overrideText) {
    const text = overrideText ?? inputText

    try {
      const result = await runTranslation({
        text,
        source: sourceLanguage,
        target: targetLanguage,
      })

      if (!result) return

      const record = {
        id: crypto.randomUUID(),
        input: text.trim(),
        output: result,
        source: sourceLanguage,
        target: targetLanguage,
        createdAt: Date.now(),
        favorite: false,
      }

      setHistory((prev) => [record, ...prev].slice(0, 40))
    } catch {
      showToast('Unable to translate at the moment.', 'error')
    }
  }

  const clearAll = () => {
    setInputText('')
    setTranslatedText('')
    setError('')
    clearRecognitionError()
    clearSpeechError()
  }

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setInputText(translatedText)
    setTranslatedText(inputText)
  }

  const copyTranslation = async () => {
    if (!translatedText) {
      showToast('Nothing to copy.', 'info')
      return
    }

    await navigator.clipboard.writeText(translatedText)
    showToast('Translation copied to clipboard.', 'success')
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const fileText = await readTextFile(file)
      setInputText(fileText)
      showToast('Text file loaded into input.', 'success')
    } catch {
      showToast('Unable to load file.', 'error')
    }
  }

  const filteredHistory = useMemo(() => {
    const query = historyQuery.trim().toLowerCase()
    if (!query) return history

    return history.filter(
      (entry) =>
        entry.input.toLowerCase().includes(query) ||
        entry.output.toLowerCase().includes(query) ||
        entry.source.toLowerCase().includes(query) ||
        entry.target.toLowerCase().includes(query),
    )
  }, [history, historyQuery])

  const favoriteCount = history.filter((entry) => entry.favorite).length

  useKeyboardShortcuts({
    onTranslate: () => handleTranslate(),
    onSwap: swapLanguages,
    onClear: clearAll,
  })

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-cyan-100 px-4 py-8 transition-colors dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 sm:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Translator Studio</h1>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              English ↔ Hindi translation with voice input and output.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/50 px-2 py-1 text-xs dark:bg-slate-900/50">
              Favorites: {favoriteCount}
            </span>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/40 bg-white/35 p-5 shadow-glass backdrop-blur dark:border-slate-700 dark:bg-slate-900/45">
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <LanguageSelector
                  label="From"
                  value={sourceLanguage}
                  exclude={targetLanguage}
                  onChange={setSourceLanguage}
                />
                <button
                  type="button"
                  onClick={swapLanguages}
                  className="rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                  aria-label="Swap languages"
                >
                  Swap
                </button>
                <LanguageSelector
                  label="To"
                  value={targetLanguage}
                  exclude={sourceLanguage}
                  onChange={setTargetLanguage}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <FileUp size={16} /> Upload .txt
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>

              <label htmlFor="input-text" className="mb-2 block text-sm font-semibold">
                Input text
              </label>
              <textarea
                id="input-text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder={`Type or speak in ${LANGUAGES[sourceLanguage].name}`}
                className="h-44 w-full rounded-2xl border border-slate-300/70 bg-white/80 p-3 outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800/70"
                aria-label="Input text"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTranslate()}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-white hover:bg-brand-700"
                    disabled={loading}
                  >
                    {loading ? <LoaderCircle size={16} className="animate-spin" /> : <AudioLines size={16} />}
                    Translate
                  </button>

                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Eraser size={16} /> Clear
                  </button>

                  {isListening ? (
                    <button
                      type="button"
                      onClick={stopListening}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-red-700 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-100"
                    >
                      <MicOff size={16} /> Stop
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!recognitionSupported}
                      onClick={() => startListening(LANGUAGES[sourceLanguage].speechLocale)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <Mic size={16} /> Speak
                    </button>
                  )}
                </div>

                <div className="text-slate-600 dark:text-slate-300">
                  Characters: {countCharacters(inputText)}
                </div>
              </div>

              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 dark:bg-red-500/20 dark:text-red-100"
                  >
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="inline-block h-2 w-2 rounded-full bg-red-500"
                    />
                    Listening...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="rounded-3xl border border-white/40 bg-white/35 p-5 shadow-glass backdrop-blur dark:border-slate-700 dark:bg-slate-900/45">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Translated text</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copyTranslation}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300/80 px-2 py-1 text-xs dark:border-slate-700"
                  >
                    <Clipboard size={14} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile(translatedText, 'translated-output.txt')}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300/80 px-2 py-1 text-xs dark:border-slate-700"
                    disabled={!translatedText}
                  >
                    <FileDown size={14} /> TXT
                  </button>
                </div>
              </div>

              <div className="min-h-36 rounded-2xl border border-slate-300/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                {loading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <LoaderCircle className="animate-spin" size={16} /> Translating...
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{translatedText || 'Translation will appear here.'}</p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      speakText({ text: translatedText, languageCode: targetLanguage, voiceURI: selectedVoiceURI })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800"
                    disabled={!speechSupported || !translatedText}
                  >
                    <Volume2 size={16} /> Speak
                  </button>
                  <button
                    type="button"
                    onClick={pause}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300/80 px-2 py-1 dark:border-slate-700"
                    disabled={!isSpeaking || isPaused}
                  >
                    <Pause size={14} /> Pause
                  </button>
                  <button
                    type="button"
                    onClick={resume}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300/80 px-2 py-1 dark:border-slate-700"
                    disabled={!isSpeaking || !isPaused}
                  >
                    <Play size={14} /> Resume
                  </button>
                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300/80 px-2 py-1 dark:border-slate-700"
                    disabled={!isSpeaking}
                  >
                    <Square size={14} /> Stop
                  </button>
                </div>
                <span className="text-slate-600 dark:text-slate-300">
                  Words: {countWords(translatedText)}
                </span>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <VoiceSelector
                  label="Voice"
                  value={selectedVoiceURI}
                  onChange={setSelectedVoiceURI}
                  voices={voices}
                  disabled={!speechSupported}
                  onRefresh={refreshVoices}
                />

                <div className="rounded-2xl border border-slate-300/70 bg-white/80 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Voice tips</p>
                  <p className="mt-1">
                    Pick a specific browser voice, or leave it on Auto for the closest match to the selected
                    language.
                  </p>
                </div>
              </div>
            </div>

            {feedbackMessage ? (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-100">
                {feedbackMessage}
              </div>
            ) : null}

            {!recognitionSupported ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Voice input is unavailable in this browser. Please use Chrome/Edge desktop.
              </p>
            ) : null}

            {!speechSupported ? (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Voice output is unavailable in this browser.
              </p>
            ) : null}

            {!navigator.onLine ? (
              <p className="text-sm text-red-700 dark:text-red-300">
                You are offline. Translation API requests will fail until connection is restored.
              </p>
            ) : null}

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Shortcuts: Ctrl+Enter (Translate), Ctrl+Shift+S (Swap), Ctrl+L (Clear)
            </p>
          </div>

          <HistoryPanel
            entries={filteredHistory}
            query={historyQuery}
            setQuery={setHistoryQuery}
            onReuse={(entry) => {
              setSourceLanguage(entry.source)
              setTargetLanguage(entry.target)
              setInputText(entry.input)
              setTranslatedText(entry.output)
              showToast('Loaded from history.', 'success')
            }}
            onToggleFavorite={(id) => {
              setHistory((prev) =>
                prev.map((entry) =>
                  entry.id === id ? { ...entry, favorite: !entry.favorite } : entry,
                ),
              )
            }}
            onDelete={(id) => setHistory((prev) => prev.filter((entry) => entry.id !== id))}
            onClear={() => setHistory([])}
          />
        </section>

        <footer className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Star size={14} />
          Modern glass UI · Responsive layout · Accessible controls
        </footer>
      </section>
    </main>
  )
}

export default TranslatorPage
