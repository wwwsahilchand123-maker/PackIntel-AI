import { motion } from 'framer-motion'
import { cn } from '@/utils/formatters'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  label?: string
  showValue?: boolean
  animate?: boolean
  height?: 'sm' | 'md' | 'lg'
}

const heightMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

export default function ProgressBar({
  value,
  max = 100,
  color = '#00D4FF',
  label,
  showValue = true,
  animate = true,
  height = 'md',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs text-text-secondary font-medium">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-mono font-bold" style={{ color }}>
              {value.toFixed(1)}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          heightMap[height]
        )}
        style={{ backgroundColor: `${color}15` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
          initial={animate ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}
