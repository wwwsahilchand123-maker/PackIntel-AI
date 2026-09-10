import { motion } from 'framer-motion'
import { getScoreLabel } from '@/utils/constants'

interface ScoreGaugeProps {
  score: number
  size?: number
  label?: string
}

export default function ScoreGauge({ score, size = 160, label }: ScoreGaugeProps) {
  const { color } = getScoreLabel(score)
  const radius = (size / 2) * 0.78
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference * (1 - score / 100)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-180deg)', marginTop: -(size / 2) }}
        >
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <motion.path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>

        {/* Score text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-2"
          style={{ top: size * 0.1 }}
        >
          <motion.span
            className="font-mono font-bold leading-none"
            style={{ fontSize: size * 0.22, color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score.toFixed(1)}
          </motion.span>
          <span className="text-text-secondary text-xs font-mono">/100</span>
        </div>
      </div>

      {label && (
        <span className="text-xs font-medium text-text-secondary text-center">
          {label}
        </span>
      )}
    </div>
  )
}
