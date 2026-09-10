import { motion } from 'framer-motion'
import { Trash2, Plus } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { MaterialDetail } from '@/types/materials'
import { MATERIAL_COLORS } from '@/utils/constants'
import { cn } from '@/utils/formatters'

interface MaterialSelectorProps {
  materials: MaterialDetail[]
  selected: string[]
  onToggle: (materialId: string) => void
}

export default function MaterialSelector({
  materials,
  selected,
  onToggle,
}: MaterialSelectorProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-text-primary">
          Select Materials
        </h3>
        <span className="text-xs font-mono text-text-secondary">
          {selected.length}/5 selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {materials.map((mat) => {
          const isSelected = selected.includes(mat.id)
          const color = MATERIAL_COLORS[mat.name] || '#00D4FF'
          const canSelect = selected.length < 5 || isSelected

          return (
            <motion.button
              key={mat.id}
              onClick={() => {
                if (canSelect) onToggle(mat.id)
              }}
              whileHover={canSelect ? { scale: 1.02 } : undefined}
              whileTap={canSelect ? { scale: 0.98 } : undefined}
              disabled={!canSelect}
              className={cn(
                'relative p-3 rounded-xl border text-sm font-medium transition-all duration-200',
                'flex flex-col items-center gap-2',
                isSelected
                  ? 'text-white'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/8',
                !canSelect && 'opacity-40 cursor-not-allowed'
              )}
              style={
                isSelected
                  ? { backgroundColor: `${color}20`, borderColor: `${color}60` }
                  : {}
              }
            >
              {isSelected && (
                <motion.div
                  layoutId="selected"
                  className="absolute inset-0 rounded-xl border-2"
                  style={{ borderColor: color }}
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}

              <span className="font-semibold">{mat.name}</span>
              <span className="text-xs opacity-70">{mat.category}</span>

              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1"
                >
                  <Trash2
                    className="w-3.5 h-3.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggle(mat.id)
                    }}
                  />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {selected.length === 5 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-neon-amber flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Maximum materials selected
        </motion.p>
      )}
    </GlassCard>
  )
}
