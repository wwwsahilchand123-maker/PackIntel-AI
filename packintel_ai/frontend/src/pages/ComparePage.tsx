import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, RotateCcw } from 'lucide-react'
import MaterialSelector from '@/components/compare/MaterialSelector'
import ComparisonTable from '@/components/compare/ComparisonTable'
import ComparisonCharts from '@/components/compare/ComparisonCharts'
import ErrorBanner from '@/components/ui/ErrorBanner'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import StatusPill from '@/components/ui/StatusPill'
import LoadingOrb from '@/components/ui/LoadingOrb'
import { useMaterials } from '@/hooks/useKnowledgeBase'
import { useCompare } from '@/hooks/useCompare'
import { useAppStore } from '@/store/appStore'
import { CompareResponse } from '@/api/compare'

export default function ComparePage() {
  const { materials } = useMaterials()
  const { demoMode } = useAppStore()
  const { compare, response, loading, error } = useCompare()
  const [selected, setSelected] = useState<string[]>([])
  const [comparisonResponse, setComparisonResponse] = useState<CompareResponse | null>(null)

  const handleToggle = (materialId: string) => {
    setSelected((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : prev.length < 5
        ? [...prev, materialId]
        : prev
    )
  }

  const handleCompare = async () => {
    if (selected.length < 2) return
    const result = await compare(selected)
    if (result) setComparisonResponse(result)
  }

  const handleReset = () => {
    setSelected([])
    setComparisonResponse(null)
  }

  const selectedMaterials = materials.filter((m) => selected.includes(m.id))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-text-primary">
              Material <span className="text-neon-green">Comparison Lab</span>
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Compare up to 5 packaging materials side-by-side with detailed analytics
            </p>
          </div>
          {comparisonResponse && (
            <NeonButton variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </NeonButton>
          )}
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MaterialSelector
            materials={materials}
            selected={selected}
            onToggle={handleToggle}
          />

          {/* Compare button */}
          <NeonButton
            variant="green"
            size="lg"
            fullWidth
            onClick={handleCompare}
            loading={loading}
            disabled={loading || selected.length < 2}
            className="mt-4"
          >
            <GitCompare className="w-5 h-5" />
            {loading
              ? 'Comparing...'
              : `Compare ${selected.length} Material${selected.length !== 1 ? 's' : ''}`}
          </NeonButton>

          {selected.length >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <GlassCard className="p-4 text-sm text-text-secondary/70">
                <p className="text-xs font-mono mb-2">Selected:</p>
                <ul className="space-y-1">
                  {selectedMaterials.map((m) => (
                    <li key={m.id} className="text-xs">
                      • <span className="text-text-primary font-medium">{m.name}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>

        {/* Right — Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard>
                  <LoadingOrb message="Analyzing materials..." size="md" />
                </GlassCard>
              </motion.div>
            )}

            {!loading && comparisonResponse && (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Winner badges */}
                <GlassCard className="p-5">
                  <h3 className="font-display font-semibold text-text-primary mb-4">
                    Winners by Property
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(
                      comparisonResponse.winner_by_property
                    ).map(([prop, winner]) => (
                      <motion.div
                        key={prop}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-xl bg-white/3 border border-white/6 text-center"
                      >
                        <p className="text-xs text-text-secondary mb-1">{prop}</p>
                        <p className="text-sm font-semibold text-neon-green">{winner}</p>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>

                {/* Comparison table */}
                <ComparisonTable
                  properties={comparisonResponse.comparison_matrix.properties}
                  data={comparisonResponse.comparison_matrix.data}
                  materialNames={selectedMaterials.map((m) => m.name)}
                />

                {/* Charts */}
                <ComparisonCharts
                  radarData={comparisonResponse.radar_data}
                  selectedMaterials={selectedMaterials.map((m) => m.name)}
                />

                {/* Overall ranking */}
                <GlassCard className="p-5">
                  <h3 className="font-display font-semibold text-text-primary mb-4">
                    Overall Ranking
                  </h3>
                  <div className="space-y-2">
                    {comparisonResponse.overall_ranking.map((item) => (
                      <motion.div
                        key={item.rank}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item.rank * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-neon-cyan/20 text-neon-cyan">
                            {item.rank}
                          </span>
                          <span className="text-sm font-medium text-text-primary">
                            {item.material_name}
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold text-neon-green">
                          {item.overall_score.toFixed(1)}/100
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {!loading && !comparisonResponse && (
              <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard className="p-12 text-center">
                  <GitCompare className="w-16 h-16 text-neon-green/20 mx-auto mb-6" />
                  <h3 className="font-display font-semibold text-text-primary mb-2">
                    Select materials to compare
                  </h3>
                  <p className="text-text-secondary text-sm max-w-xs mx-auto">
                    Choose 2-5 materials from the list on the left, then click{' '}
                    <span className="text-neon-green">Compare</span> to see detailed side-by-side
                    analysis.
                  </p>

                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { icon: '📊', label: 'Property Matrix' },
                      { icon: '📈', label: 'Radar Charts' },
                      { icon: '🏆', label: 'Rankings' },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <p className="text-xs text-text-secondary">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
