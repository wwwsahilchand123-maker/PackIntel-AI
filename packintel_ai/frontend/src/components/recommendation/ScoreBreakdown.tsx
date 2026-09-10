import { motion } from 'framer-motion'
import { ScoreBreakdown as SB } from '@/types/recommendation'
import ProgressBar from '@/components/ui/ProgressBar'
import GlassCard from '@/components/ui/GlassCard'

interface ScoreBreakdownProps {
  breakdown: SB
}

const DIMENSION_CONFIG = [
  {
    key: 'moisture_score' as const,
    label: 'Moisture Barrier',
    color: '#00D4FF',
    weight: '20%',
  },
  {
    key: 'oxygen_score' as const,
    label: 'Oxygen Barrier',
    color: '#7B2FFF',
    weight: '20%',
  },
  {
    key: 'temperature_score' as const,
    label: 'Temperature',
    color: '#FFB800',
    weight: '15%',
  },
  {
    key: 'shelf_life_score' as const,
    label: 'Shelf Life',
    color: '#00FF9D',
    weight: '20%',
  },
  {
    key: 'sustainability_score' as const,
    label: 'Sustainability',
    color: '#50C878',
    weight: '15%',
  },
  {
    key: 'rag_relevance_score' as const,
    label: 'RAG Relevance',
    color: '#FF69B4',
    weight: '10%',
  },
]

export default function ScoreBreakdownComponent({ breakdown }: ScoreBreakdownProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-text-primary">
          Score Breakdown
        </h3>
        <span className="text-xs font-mono text-text-secondary">Transparent Scoring</span>
      </div>

      <div className="space-y-4">
        {DIMENSION_CONFIG.map((dim, i) => (
          <motion.div
            key={dim.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dim.color, boxShadow: `0 0 4px ${dim.color}` }}
                />
                <span className="text-xs text-text-secondary">{dim.label}</span>
                <span className="text-xs text-text-secondary/40 font-mono">×{dim.weight}</span>
              </div>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: dim.color }}
              >
                {breakdown[dim.key].toFixed(1)}
              </span>
            </div>
            <ProgressBar
              value={breakdown[dim.key]}
              color={dim.color}
              showValue={false}
              height="sm"
            />
          </motion.div>
        ))}
      </div>

      {/* Penalties */}
      {breakdown.penalties_applied.length > 0 && (
        <div className="mt-5 p-3 rounded-xl bg-neon-red/5 border border-neon-red/20">
          <p className="text-xs font-medium text-neon-red mb-2">Penalties Applied</p>
          <ul className="space-y-1">
            {breakdown.penalties_applied.map((p, i) => (
              <li key={i} className="text-xs text-text-secondary leading-relaxed">
                • {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Final score row */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-sm font-display font-semibold text-text-primary">
          Final Score
        </span>
        <span className="text-lg font-mono font-bold text-neon-cyan">
          {breakdown.final_score.toFixed(1)}/100
        </span>
      </div>
    </GlassCard>
  )
}
