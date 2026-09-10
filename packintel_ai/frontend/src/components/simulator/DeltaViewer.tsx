import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import StatusPill from '@/components/ui/StatusPill'
import ScoreBadge from '@/components/ui/ScoreBadge'
import { getScoreLabel, MATERIAL_COLORS } from '@/utils/constants'

interface DeltaViewerProps {
  beforeMaterial: string
  afterMaterial: string
  beforeScore: number
  afterScore: number
  scoreDelta: number
  changed: boolean
  summary: string
}

export default function DeltaViewer({
  beforeMaterial,
  afterMaterial,
  beforeScore,
  afterScore,
  scoreDelta,
  changed,
  summary,
}: DeltaViewerProps) {
  const beforeColor = MATERIAL_COLORS[beforeMaterial] || '#00D4FF'
  const afterColor = MATERIAL_COLORS[afterMaterial] || '#00D4FF'

  const improved = scoreDelta > 0
  const deltaColor = improved ? '#00FF9D' : scoreDelta < 0 ? '#FF3D3D' : '#FFB800'
  const DeltaIcon = improved ? TrendingUp : scoreDelta < 0 ? TrendingDown : Minus

  return (
    <GlassCard className="p-6">
      <h3 className="font-display font-semibold text-text-primary mb-6">
        Comparison Summary
      </h3>

      {/* Before → After flow */}
      <div className="flex items-center justify-between mb-8">
        {/* Before */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 text-center"
        >
          <p className="text-xs text-text-secondary mb-2 uppercase font-mono">Before</p>
          <div
            className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center font-display font-bold text-sm"
            style={{
              backgroundColor: `${beforeColor}20`,
              color: beforeColor,
              border: `2px solid ${beforeColor}40`,
            }}
          >
            {beforeMaterial.slice(0, 3)}
          </div>
          <p className="font-semibold text-text-primary text-sm mb-1">{beforeMaterial}</p>
          <ScoreBadge score={beforeScore} size="sm" showLabel={false} />
        </motion.div>

        {/* Arrow with delta */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-shrink-0 mx-6 flex flex-col items-center gap-2"
        >
          <ArrowRight className="w-5 h-5 text-text-secondary" />
          <div
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-xs font-bold"
            style={{
              color: deltaColor,
              backgroundColor: `${deltaColor}15`,
              border: `1px solid ${deltaColor}40`,
            }}
          >
            <DeltaIcon className="w-3 h-3" />
            {improved ? '+' : ''}{scoreDelta.toFixed(1)}
          </div>
        </motion.div>

        {/* After */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="flex-1 text-center"
        >
          <p className="text-xs text-text-secondary mb-2 uppercase font-mono">After</p>
          <div
            className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center font-display font-bold text-sm"
            style={{
              backgroundColor: `${afterColor}20`,
              color: afterColor,
              border: `2px solid ${afterColor}40`,
            }}
          >
            {afterMaterial.slice(0, 3)}
          </div>
          <p className="font-semibold text-text-primary text-sm mb-1">{afterMaterial}</p>
          <ScoreBadge score={afterScore} size="sm" showLabel={false} />
        </motion.div>
      </div>

      {/* Change indicator */}
      <div className="mb-4">
        {changed ? (
          <StatusPill
            label={`Recommendation changed from ${beforeMaterial} to ${afterMaterial}`}
            variant="warning"
          />
        ) : (
          <StatusPill
            label={`${afterMaterial} remains the top choice (score ${improved ? 'improved' : 'decreased'})`}
            variant="info"
          />
        )}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/6">
        <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>
      </div>
    </GlassCard>
  )
}
