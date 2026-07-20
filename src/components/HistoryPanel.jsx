import { Heart, Search, Trash2 } from 'lucide-react'
import { buildHistoryLabel } from '../utils/text'

const HistoryPanel = ({
  entries,
  query,
  setQuery,
  onReuse,
  onToggleFavorite,
  onDelete,
  onClear,
}) => (
  <section className="rounded-3xl border border-white/40 bg-white/35 p-5 shadow-glass backdrop-blur dark:border-slate-700 dark:bg-slate-900/40">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Translation History</h2>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2 py-1 text-sm text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-200"
      >
        <Trash2 size={14} />
        Delete all
      </button>
    </div>

    <label className="mb-4 flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/70">
      <Search size={16} className="text-slate-500" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search history"
        className="w-full bg-transparent text-sm outline-none"
        aria-label="Search history"
      />
    </label>

    <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {entries.length === 0 ? (
        <li className="rounded-xl bg-white/60 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          No translations yet.
        </li>
      ) : (
        entries.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-slate-200/70 bg-white/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={() => onReuse(entry)}
              className="w-full text-left"
              aria-label="Reuse translation"
            >
              <p className="line-clamp-2 text-sm font-medium">{entry.input}</p>
              <p className="line-clamp-2 text-sm text-brand-700 dark:text-brand-50">{entry.output}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{buildHistoryLabel(entry)}</p>
            </button>
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onToggleFavorite(entry.id)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-slate-200/70 dark:hover:bg-slate-700"
              >
                <Heart
                  size={14}
                  className={entry.favorite ? 'fill-red-500 text-red-500' : 'text-slate-500'}
                />
                Favorite
              </button>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                className="text-xs text-red-600 dark:text-red-300"
              >
                Remove
              </button>
            </div>
          </li>
        ))
      )}
    </ul>
  </section>
)

export default HistoryPanel
