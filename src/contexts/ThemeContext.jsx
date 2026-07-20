import { useEffect, useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ThemeContext } from './themeContext'

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage('translator-theme', 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
