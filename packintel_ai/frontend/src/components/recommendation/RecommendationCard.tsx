import { motion } from 'framer-motion'
import { Star, Recycle, Leaf, DollarSign, Thermometer } from 'lucide-react'
import { RecommendationResult } from '@/types/recommendation'
import { MaterialDetail } from '@/types/materials'
import GlassCard from '@/components/ui/GlassCard'
import ScoreGauge from '@/components/charts/ScoreGauge'
import StatusPill from '@/components/ui/StatusPill'
import RadarChartComponent from '@/components/charts/RadarChart'
import { getScoreLabel, MATERIAL_COLORS } from '@/utils/constants'

interface RecommendationCardProps {
  recommendation: RecommendationResult
  foodCommodity: string
}

function MaterialBadge({ material }: { material: MaterialDetail }) {
  const color = MATERIAL_COLORS[material.name] || '#00D4FF'
  return (
    <div className="flex flex-wrap gap-2">
      {material.recyclable && (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20">
          <Recycle className="w-3 h-3" /> Recyclable
        </span>
      )}
      {material.compostable && (
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/20">
          <Leaf className="w-3 h-3" /> Compostable
        </span>
      )}
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 text-text-secondary border border-white/10 capitalize">
        <DollarSign className="w-3 h-3" /> {material.cost_tier}
      </span>
      <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 text-text-secondary border border-white/10">
        <Thermometer className="w-3 h-3" />
        {material.temp_min_c}°C to {material.temp_max_c}°C
      </span>
    </div>
  )
}

export default function RecommendationCard({
  recommendation,
  foodCommodity,
}: RecommendationCardProps) {
  const { material, compatibility_score, score_label, score_breakdown, confidence } = recommendation
  const { color } = getScoreLabel(compatibility_score)
  const matColor = MATERIAL_COLORS[material.name] || color

  const radarData = [
    { subject: 'Moisture', value: score_breakdown.moisture_score, fullMark: 100 },
    { subject: 'Oxygen', value: score_breakdown.oxygen_score, fullMark: 100 },
    { subject: 'Temperature', value: score_breakdown.temperature_score, fullMark: 100 },
    { subject: 'Shelf Life', value: score_breakdown.shelf_life_score, fullMark: 100 },
    { subject: 'Sustainability', value: score_breakdown.sustainability_score, fullMark: 100 },
    { subject: 'Relevance', value: score_breakdown.rag_relevance_score, fullMark: 100 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard
        className="relative overflow-hidden"
        neon="cyan"
      >
        {/* Glow backdrop */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: matColor }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-neon-amber" />
              <span className="text-xs font-mono text-neon-amber uppercase tracking-widest">
                Top Recommendation
              </span>
            </div>
            <h2 className="font-display font-bold text-2xl text-text-primary">
              {material.name}
            </h2>
            {material.description && (
              <p className="text-sm text-text-secondary mt-1 max-w-sm leading-relaxed">
                {material.description.slice(0, 120)}...
              </p>
            )}
          </div>

          {/* Score Gauge */}
          <div className="flex-shrink-0">
            <ScoreGauge score={compatibility_score} size={130} />
          </div>
        </div>

        {/* Score label pill */}
        <div className="flex items-center gap-3 mb-5">
          <StatusPill
            label={score_label}
            variant={
              compatibility_score >= 90 ? 'success' :
              compatibility_score >= 75 ? 'info' :
              compatibility_score >= 60 ? 'warning' : 'error'
            }
            pulse={compatibility_score >= 75}
          />
          <span className="text-xs font-mono text-text-secondary">
            Confidence: {(confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Material badges */}
        <MaterialBadge material={material} />

        {/* Key properties */}
        {material.key_properties && material.key_properties.length > 0 && (
          <div className="mt-5">
            <p className="text-xs text-text-secondary mb-2 font-mono uppercase tracking-widest">
              Key Properties
            </p>
            <div className="flex flex-wrap gap-2">
              {material.key_properties.slice(0, 5).map((prop) => (
                <span
                  key={prop}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-text-secondary"
                >
                  {prop}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Radar Chart */}
        <div className="mt-6">
          <p className="text-xs text-text-secondary mb-1 font-mono uppercase tracking-widest text-center">
            Compatibility Profile
          </p>
          <RadarChartComponent data={radarData} color={matColor} size={240} />
        </div>
      </GlassCard>
    </motion.div>
  )
}
