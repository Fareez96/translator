export const countWords = (value) => {
  if (!value.trim()) return 0
  return value.trim().split(/\s+/u).length
}

export const countCharacters = (value) => value.length

export const buildHistoryLabel = (entry) =>
  `${entry.source.toUpperCase()} → ${entry.target.toUpperCase()} · ${new Date(entry.createdAt).toLocaleString()}`
