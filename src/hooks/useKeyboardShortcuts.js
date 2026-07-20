import { useEffect } from 'react'

export const useKeyboardShortcuts = ({ onTranslate, onSwap, onClear }) => {
  useEffect(() => {
    const listener = (event) => {
      const key = event.key.toLowerCase()

      if (event.ctrlKey && key === 'enter') {
        event.preventDefault()
        onTranslate?.()
      }

      if (event.ctrlKey && event.shiftKey && key === 's') {
        event.preventDefault()
        onSwap?.()
      }

      if (event.ctrlKey && key === 'l') {
        event.preventDefault()
        onClear?.()
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [onClear, onSwap, onTranslate])
}
