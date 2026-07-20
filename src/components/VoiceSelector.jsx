const VoiceSelector = ({ value, onChange, label, voices, disabled = false, onRefresh }) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
    <span>{label}</span>
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="min-w-0 flex-1 rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100"
        aria-label={label}
      >
        <option value="">Auto</option>
        {voices.map((voice) => (
          <option key={voice.voiceURI} value={voice.voiceURI}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onRefresh}
        disabled={disabled}
        className="rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/70 dark:hover:bg-slate-700"
      >
        Refresh
      </button>
    </div>
  </label>
)

export default VoiceSelector