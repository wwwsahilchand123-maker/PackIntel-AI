import { cn } from '@/utils/formatters'
import { getScoreLabel } from '@/utils/constants'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const { label, color } = getScoreLabel(score)

  const sizeMap = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-base px-3 py-1',
    lg: 'text-2xl px-4 py-2',
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          'font-mono font-bold rounded-lg border',
          sizeMap[size]
        )}
        style={{
          color,
          borderColor: `${color}40`,
          backgroundColor: `${color}10`,
        }}
      >
        {score.toFixed(1)}
      </span>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  )
}
