import { MoonStar, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-xl border border-slate-300/60 bg-white/40 px-3 py-2 text-sm font-medium text-slate-700 shadow-glass backdrop-blur dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-100"
      aria-label="Toggle dark mode"
    >
      <span className="flex items-center gap-2">
        {theme === 'dark' ? <Sun size={16} /> : <MoonStar size={16} />}
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}

export default ThemeToggle
