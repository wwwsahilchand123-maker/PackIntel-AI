import { motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import RadarChartComponent from '@/components/charts/RadarChart'
import { RadarDataPoint } from '@/api/compare'
import { MATERIAL_COLORS } from '@/utils/constants'

interface ComparisonChartsProps {
  radarData: RadarDataPoint[]
  selectedMaterials: string[]
}

export default function ComparisonCharts({
  radarData,
  selectedMaterials,
}: ComparisonChartsProps) {
  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-4">
          Property Radar
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {selectedMaterials.slice(0, 2).map((matName, idx) => {
            const color = MATERIAL_COLORS[matName] || '#00D4FF'
            const matData = radarData.map((r) => ({
              subject: r.property.split(' ')[0], // Shorten for radar
              value: r.values[matName] ?? 0,
              fullMark: 100,
            }))

            return (
              <motion.div
                key={matName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <p className="text-sm font-medium text-text-primary mb-3 text-center">
                  {matName}
                </p>
                <RadarChartComponent data={matData} color={color} size={240} />
              </motion.div>
            )
          })}
        </div>
      </GlassCard>

      {/* Overall scores */}
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-4">
          Overall Scores
        </h3>
        <div className="space-y-3">
          {selectedMaterials.map((name) => {
            const color = MATERIAL_COLORS[name] || '#00D4FF'
            const score = Math.random() * 30 + 60 // Demo score

            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{name}</span>
                  <span className="text-sm font-mono font-bold" style={{ color }}>
                    {score.toFixed(1)}/100
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}60`,
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </GlassCard>
    </div>
  )
}
