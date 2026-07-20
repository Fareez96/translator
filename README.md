# Translator Studio (English ↔ Hindi)

A production-ready React + Vite translation app inspired by Google Translate, with:

- English → Hindi and Hindi → English translation
- Voice input (SpeechRecognition)
- Voice output (SpeechSynthesis)
- Glassmorphism UI with dark/light mode
- Translation history, favorites, search, and persistence
- Keyboard shortcuts and accessibility support
- Ready for **Vercel** and **GitHub Pages**

## Tech Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- LibreTranslate API (abstracted service layer)

## Project Structure

```text
src/
  components/
  contexts/
  hooks/
  pages/
  services/
  styles/
  types/
  utils/
```

## Key Features

### Translation
- Direction support: EN → HI and HI → EN
- Swap languages
- Clear input/output
- Copy translated text
- Character count + word count
- Loading indicator + friendly API error messages

### Voice Input
- Microphone start/stop
- Speech recognition with selected source language
- Auto-fill input from speech
- Auto-translate on speech result
- Browser support check + fallback message

### Voice Output
- Speak translated text in target language voice
- Pause / Resume / Stop controls
- Voice support fallback notifications

### History & Utilities
- Save recent translations in localStorage
- Favorite/unfavorite entries
- Search and delete history
- Upload input from `.txt`
- Download output as `.txt`

### UX/UI
- Gradient background, glass cards, rounded corners, soft shadows
- Responsive desktop/tablet/mobile layout
- Framer Motion animations for listening and toasts

### Accessibility
- Semantic controls and ARIA labels
- Keyboard-friendly interactions
- High-contrast-compatible theme behavior

### Keyboard Shortcuts
- `Ctrl + Enter` → Translate
- `Ctrl + Shift + S` → Swap languages
- `Ctrl + L` → Clear

## Architecture Notes

Translation is abstracted through `src/services/translationService.js`:

- Default provider: LibreTranslate when `VITE_TRANSLATE_API_KEY` is set, otherwise MyMemory fallback
- NVIDIA support: set `VITE_NVIDIA_API_KEY` to use NVIDIA's OpenAI-compatible chat endpoint for translation
- Future providers (Google/Azure/DeepL) can be added behind the same interface

Speech capabilities are isolated in:

- `src/services/speechRecognitionService.js`
- `src/services/speechSynthesisService.js`

## Installation

```bash
npm install
npm run dev
```

## Build & Lint

```bash
npm run lint
npm run build
```

## Environment Variables

Optional:

```bash
VITE_NVIDIA_API_KEY=your_nvidia_api_key_here
VITE_NVIDIA_MODEL=meta/llama-3.1-8b-instruct
VITE_TRANSLATE_PROVIDER=libre
VITE_TRANSLATE_API_URL=https://translate.argosopentech.com/translate
VITE_TRANSLATE_API_KEY=your_api_key_here
```

If you leave `VITE_TRANSLATE_PROVIDER` unset, the app uses NVIDIA when `VITE_NVIDIA_API_KEY` is present, LibreTranslate when `VITE_TRANSLATE_API_KEY` is present, and falls back to MyMemory otherwise.

Voice input works best in Chrome or Edge on HTTPS sites. GitHub Pages is HTTPS, but browsers that do not expose the Web Speech API will show the fallback message in the app.

For GitHub Pages deployments, add `NWWW` or `VITE_TRANSLATE_API_KEY` in the repo's GitHub Actions secrets so the workflow can inject it during the build. The workflow maps `NWWW` to the app's `VITE_NVIDIA_API_KEY` variable.

## Deploy on Vercel

1. Push repo to GitHub.
2. Import project into Vercel.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add optional env var `VITE_TRANSLATE_API_URL`.
6. Add `VITE_TRANSLATE_API_KEY` if your LibreTranslate instance requires one.

## Deploy on GitHub Hosting (GitHub Pages)

This repo includes `.github/workflows/deploy-github-pages.yml`.

1. Push to `main`.
2. In GitHub repo settings, set **Pages** source to **GitHub Actions**.
3. Workflow builds Vite app with `GITHUB_PAGES=true` and deploys `/dist`.
4. Site will be published at:
   `https://fareez96.github.io/translator/`

## Screenshots (Mockups)

Suggested mockup captures:
- Light mode desktop translator view
- Dark mode desktop translator view
- Mobile responsive view with history panel below translator
- Voice listening state with animated indicator

## Future Improvements

- Auto language detection
- Real-time translation with debounce
- PDF export
- PWA installable app + offline cache
- Translation analytics dashboard
- Unit tests for major components
- Dockerfile for container deployment
