import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { RankedMaterial } from '@/types/recommendation'
import { getScoreLabel, MATERIAL_COLORS } from '@/utils/constants'
import { cn } from '@/utils/formatters'

interface AllMaterialsTableProps {
  materials: RankedMaterial[]
}

type SortKey = 'rank' | 'name' | 'score' | 'moisture' | 'oxygen' | 'eco'

export default function AllMaterialsTable({ materials }: AllMaterialsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = [...materials].sort((a, b) => {
    let av: number | string = 0
    let bv: number | string = 0

    switch (sortKey) {
      case 'rank': av = a.rank; bv = b.rank; break
      case 'name': av = a.material.name; bv = b.material.name; break
      case 'score': av = a.compatibility_score; bv = b.compatibility_score; break
      case 'moisture': av = a.score_breakdown.moisture_score; bv = b.score_breakdown.moisture_score; break
      case 'oxygen': av = a.score_breakdown.oxygen_score; bv = b.score_breakdown.oxygen_score; break
      case 'eco': av = a.material.eco_score; bv = b.material.eco_score; break
    }

    if (typeof av === 'string') return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const SortHeader = ({
    k,
    label,
    className,
  }: {
    k: SortKey
    label: string
    className?: string
  }) => (
    <th
      className={cn(
        'px-3 py-2 text-left text-xs font-mono text-text-secondary cursor-pointer select-none hover:text-neon-cyan transition-colors',
        className
      )}
      onClick={() => {
        if (sortKey === k) setSortAsc((a) => !a)
        else { setSortKey(k); setSortAsc(true) }
      }}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === k ? (
          sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : null}
      </div>
    </th>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-white/5">
            <SortHeader k="rank" label="#" />
            <SortHeader k="name" label="Material" />
            <SortHeader k="score" label="Score" />
            <SortHeader k="moisture" label="Moisture" />
            <SortHeader k="oxygen" label="Oxygen" />
            <SortHeader k="eco" label="Eco" />
            <th className="px-3 py-2 text-left text-xs font-mono text-text-secondary">Label</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => {
            const { color } = getScoreLabel(item.compatibility_score)
            const matColor = MATERIAL_COLORS[item.material.name] || color
            return (
              <motion.tr
                key={item.material.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-white/3 hover:bg-white/2 transition-colors"
              >
                <td className="px-3 py-3 text-xs font-mono text-text-secondary">{item.rank}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: matColor }}
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {item.material.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="text-sm font-mono font-bold" style={{ color }}>
                    {item.compatibility_score.toFixed(1)}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs font-mono text-text-secondary">
                  {item.score_breakdown.moisture_score.toFixed(0)}
                </td>
                <td className="px-3 py-3 text-xs font-mono text-text-secondary">
                  {item.score_breakdown.oxygen_score.toFixed(0)}
                </td>
                <td className="px-3 py-3 text-xs font-mono text-text-secondary">
                  {item.material.eco_score}
                </td>
                <td className="px-3 py-3">
                  <span
                    className="text-xs px-2 py-0.5 rounded-lg font-medium"
                    style={{ color, backgroundColor: `${color}15` }}
                  >
                    {item.score_label}
                  </span>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
