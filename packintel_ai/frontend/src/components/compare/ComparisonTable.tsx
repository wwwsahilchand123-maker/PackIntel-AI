import { motion } from 'framer-motion'
import { RadarChartData } from '@/api/compare'
import GlassCard from '@/components/ui/GlassCard'
import { MATERIAL_COLORS } from '@/utils/constants'

interface ComparisonTableProps {
  properties: string[]
  data: Record<string, Record<string, number>>
  materialNames: string[]
}

export default function ComparisonTable({
  properties,
  data,
  materialNames,
}: ComparisonTableProps) {
  const getColorForValue = (prop: string, value: number, isLower?: boolean) => {
    if (isLower) {
      // For "lower is better" properties
      return value <= 5 ? '#00FF9D' : value <= 20 ? '#FFB800' : '#FF3D3D'
    }
    // For "higher is better" properties
    return value >= 75 ? '#00FF9D' : value >= 50 ? '#FFB800' : '#FF3D3D'
  }

  const lowerIsBetter = ['moisture_barrier', 'oxygen_barrier', 'temp_min_c']

  return (
    <GlassCard className="p-5 overflow-x-auto">
      <h3 className="font-display font-semibold text-text-primary mb-4">
        Property Comparison
      </h3>

      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-3 py-3 text-xs font-mono text-text-secondary">
              Property
            </th>
            {materialNames.map((name) => {
              const color = MATERIAL_COLORS[name] || '#00D4FF'
              return (
                <th
                  key={name}
                  className="text-center px-3 py-3 text-xs font-semibold"
                  style={{ color }}
                >
                  {name}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {properties.map((prop, propIdx) => (
            <motion.tr
              key={prop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: propIdx * 0.03 }}
              className="border-b border-white/3 hover:bg-white/2 transition-colors"
            >
              <td className="text-left px-3 py-3 text-xs font-medium text-text-secondary sticky left-0 bg-[#050810] z-10">
                {prop}
              </td>
              {materialNames.map((matName) => {
                const value = data[prop]?.[matName] ?? '-'
                const isNum = typeof value === 'number'
                const color = isNum
                  ? getColorForValue(
                      prop,
                      value,
                      lowerIsBetter.includes(prop)
                    )
                  : undefined

                return (
                  <td
                    key={`${prop}-${matName}`}
                    className="text-center px-3 py-3 text-sm font-mono"
                  >
                    {isNum ? (
                      <span
                        className="px-2 py-1 rounded-lg font-bold"
                        style={{
                          color,
                          backgroundColor: `${color}15`,
                        }}
                      >
                        {value.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-text-secondary">{value}</span>
                    )}
                  </td>
                )
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  )
}
