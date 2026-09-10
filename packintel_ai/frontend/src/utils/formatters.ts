export const formatScore = (score: number): string => score.toFixed(1)

export const formatPercent = (value: number): string => `${Math.round(value)}%`

export const formatDays = (days: number): string => {
  if (days >= 365) return `${(days / 365).toFixed(1)} years`
  if (days >= 30) return `${Math.round(days / 30)} months`
  return `${days} days`
}

export const formatTemp = (c: number): string => `${c}°C`

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ')
