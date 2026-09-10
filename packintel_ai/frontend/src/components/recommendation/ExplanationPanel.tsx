import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Lightbulb, Info, AlertTriangle, Shield } from 'lucide-react'
import { ExplanationBlock } from '@/types/recommendation'
import GlassCard from '@/components/ui/GlassCard'
import { cn } from '@/utils/formatters'

interface ExplanationPanelProps {
  blocks: ExplanationBlock[]
}

const TYPE_CONFIG = {
  primary: {
    icon: Lightbulb,
    color: '#00D4FF',
    bg: 'bg-neon-cyan/5',
    border: 'border-neon-cyan/20',
  },
  detail: {
    icon: Info,
    color: '#7B2FFF',
    bg: 'bg-neon-violet/5',
    border: 'border-neon-violet/20',
  },
  caveat: {
    icon: AlertTriangle,
    color: '#FFB800',
    bg: 'bg-neon-amber/5',
    border: 'border-neon-amber/20',
  },
  regulation: {
    icon: Shield,
    color: '#00FF9D',
    bg: 'bg-neon-green/5',
    border: 'border-neon-green/20',
  },
}

function ExplanationBlockItem({ block, index }: { block: ExplanationBlock; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const config = TYPE_CONFIG[block.type] || TYPE_CONFIG.detail
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'rounded-xl border overflow-hidden',
        config.bg,
        config.border
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: config.color }} />
          <span className="text-sm font-medium text-text-primary">{block.heading}</span>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{
              color: config.color,
              backgroundColor: `${config.color}15`,
            }}
          >
            {(block.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-secondary transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              <p className="text-sm text-text-secondary leading-relaxed">{block.content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ExplanationPanel({ blocks }: ExplanationPanelProps) {
  return (
    <GlassCard className="p-5">
      <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-neon-amber" />
        Why This Material?
      </h3>
      <div className="space-y-3">
        {blocks.map((block, i) => (
          <ExplanationBlockItem key={i} block={block} index={i} />
        ))}
      </div>
    </GlassCard>
  )
}
