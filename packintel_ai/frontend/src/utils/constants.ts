export const APP_NAME = 'PackIntel AI'
export const APP_VERSION = '1.0.0'

export const MATERIAL_COLORS: Record<string, string> = {
  PET: '#00D4FF',
  HDPE: '#7B2FFF',
  LDPE: '#00FF9D',
  PP: '#FFB800',
  Glass: '#FF6B6B',
  Aluminum: '#C0C0C0',
  Paperboard: '#8B7355',
  PLA: '#50C878',
  PHA: '#98FB98',
  Multilayer: '#FF69B4',
}

export const SCORE_LABELS = {
  EXCELLENT: { min: 90, label: 'Excellent Match', color: '#00FF9D' },
  GOOD: { min: 75, label: 'Good Match', color: '#00D4FF' },
  ACCEPTABLE: { min: 60, label: 'Acceptable', color: '#FFB800' },
  SUBOPTIMAL: { min: 40, label: 'Suboptimal', color: '#FF8C00' },
  NOT_RECOMMENDED: { min: 0, label: 'Not Recommended', color: '#FF3D3D' },
}

export const getScoreLabel = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: 'Excellent Match', color: '#00FF9D' }
  if (score >= 75) return { label: 'Good Match', color: '#00D4FF' }
  if (score >= 60) return { label: 'Acceptable', color: '#FFB800' }
  if (score >= 40) return { label: 'Suboptimal', color: '#FF8C00' }
  return { label: 'Not Recommended', color: '#FF3D3D' }
}
