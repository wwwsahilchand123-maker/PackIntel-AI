import { motion } from 'framer-motion'
import { RankedMaterial } from '@/types/recommendation'
import GlassCard from '@/components/ui/GlassCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { getScoreLabel, MATERIAL_COLORS } from '@/utils/constants'
import { cn } from '@/utils/formatters'

interface AlternativesListProps {
  alternatives: RankedMaterial[]
}

function AlternativeItem({
  alt,
  index,
}: {
  alt: RankedMaterial
  index: number
}) {
  const { color } = getScoreLabel(alt.compatibility_score)
  const matColor = MATERIAL_COLORS[alt.material.name] || color

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-4 rounded-xl bg-white/3 border border-white/6 hover:border-white/12 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
            style={{
              backgroundColor: `${matColor}20`,
              color: matColor,
              border: `1px solid ${matColor}40`,
            }}
          >
            {alt.rank}
          </span>
          <div>
            <p className="text-sm font-semibold text-text-primary">{alt.material.name}</p>
            <p className="text-xs text-text-secondary capitalize">{alt.material.category}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-mono font-bold" style={{ color }}>
            {alt.compatibility_score.toFixed(1)}
          </p>
          <p className="text-xs text-text-secondary">{alt.score_label}</p>
        </div>
      </div>

      <ProgressBar
        value={alt.compatibility_score}
        color={matColor}
        showValue={false}
        height="sm"
      />

      {/* Mini breakdown */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-mono text-text-secondary/60">
        <span>M: {alt.score_breakdown.moisture_score.toFixed(0)}</span>
        <span>O: {alt.score_breakdown.oxygen_score.toFixed(0)}</span>
        <span>S: {alt.score_breakdown.shelf_life_score.toFixed(0)}</span>
      </div>
    </motion.div>
  )
}

export default function AlternativesList({ alternatives }: AlternativesListProps) {
  return (
    <GlassCard className="p-5">
      <h3 className="font-display font-semibold text-text-primary mb-4">
        Alternatives
      </h3>
      <div className="space-y-3">
        {alternatives.map((alt, i) => (
          <AlternativeItem key={alt.material.id} alt={alt} index={i} />
        ))}
      </div>
    </GlassCard>
  )
}
