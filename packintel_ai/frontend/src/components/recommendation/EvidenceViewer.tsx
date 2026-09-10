import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, ChevronRight } from 'lucide-react'
import { EvidenceChunk } from '@/types/recommendation'
import GlassCard from '@/components/ui/GlassCard'
import { cn } from '@/utils/formatters'

interface EvidenceViewerProps {
  evidence: EvidenceChunk[]
}

function EvidenceItem({ chunk, index }: { chunk: EvidenceChunk; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const preview = chunk.content.slice(0, 140)
  const hasMore = chunk.content.length > 140

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="p-3 rounded-xl bg-white/3 border border-white/6 hover:border-neon-cyan/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-3 h-3 text-neon-cyan flex-shrink-0" />
          <span className="text-xs text-neon-cyan truncate">{chunk.source}</span>
        </div>
        <span className="text-xs font-mono text-text-secondary/60 flex-shrink-0">
          {(chunk.relevance_score * 100).toFixed(0)}% rel.
        </span>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">
        {expanded ? chunk.content : preview}
        {hasMore && !expanded && '...'}
      </p>

      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 flex items-center gap-1 text-xs text-neon-cyan/60 hover:text-neon-cyan transition-colors"
        >
          <ChevronRight
            className={cn('w-3 h-3 transition-transform', expanded && 'rotate-90')}
          />
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </motion.div>
  )
}

export default function EvidenceViewer({ evidence }: EvidenceViewerProps) {
  if (!evidence || evidence.length === 0) {
    return (
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-text-secondary" />
          Supporting Evidence
        </h3>
        <p className="text-sm text-text-secondary/60">
          No evidence chunks retrieved. Running in demo mode with curated KB.
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-5">
      <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Database className="w-4 h-4 text-neon-cyan" />
        Supporting Evidence
        <span className="text-xs font-mono text-text-secondary">
          ({evidence.length} source{evidence.length !== 1 ? 's' : ''})
        </span>
      </h3>
      <div className="space-y-2">
        {evidence.map((chunk, i) => (
          <EvidenceItem key={chunk.chunk_id} chunk={chunk} index={i} />
        ))}
      </div>
    </GlassCard>
  )
}
