import { LANGUAGE_OPTIONS } from '../types/languages'

const LanguageSelector = ({ value, onChange, label, exclude }) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
    <span>{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100"
      aria-label={label}
    >
      {LANGUAGE_OPTIONS.filter((option) => option.code !== exclude).map((option) => (
        <option key={option.code} value={option.code}>
          {option.name}
        </option>
      ))}
    </select>
  </label>
)

export default LanguageSelector
