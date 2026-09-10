import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, RotateCcw, ChevronDown } from 'lucide-react'
import FoodInputForm from '@/components/recommendation/FoodInputForm'
import RecommendationCard from '@/components/recommendation/RecommendationCard'
import ScoreBreakdownComponent from '@/components/recommendation/ScoreBreakdown'
import ExplanationPanel from '@/components/recommendation/ExplanationPanel'
import EvidenceViewer from '@/components/recommendation/EvidenceViewer'
import AlternativesList from '@/components/recommendation/AlternativesList'
import AllMaterialsTable from '@/components/recommendation/AllMaterialsTable'
import AnalysisLoadingState from '@/components/recommendation/AnalysisLoadingState'
import ErrorBanner from '@/components/ui/ErrorBanner'
import NeonButton from '@/components/ui/NeonButton'
import StatusPill from '@/components/ui/StatusPill'
import GlassCard from '@/components/ui/GlassCard'
import { useRecommendation } from '@/hooks/useRecommendation'
import { useRecommendStore } from '@/store/recommendStore'
import { useAppStore } from '@/store/appStore'
import { RecommendFormValues } from '@/utils/validators'
import { RecommendRequest } from '@/types/recommendation'

export default function AnalyzerPage() {
  const { analyze, loading, error, response } = useRecommendation()
  const { reset } = useRecommendStore()
  const { demoMode } = useAppStore()
  const [showAllMaterials, setShowAllMaterials] = useState(false)

  const handleSubmit = async (values: RecommendFormValues) => {
    const request: RecommendRequest = {
      food_commodity: values.food_commodity,
      food_category: values.food_category,
      moisture_sensitivity: values.moisture_sensitivity,
      oxygen_sensitivity: values.oxygen_sensitivity,
      temperature_min: values.temperature_min,
      temperature_max: values.temperature_max,
      humidity_min: values.humidity_min,
      humidity_max: values.humidity_max,
      shelf_life_days: values.shelf_life_days,
      sustainability_preference: values.sustainability_preference,
      special_requirements: values.special_requirements,
      demo_mode: demoMode,
    }
    await analyze(request)
  }

  const handleReset = () => {
    reset()
    setShowAllMaterials(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Packaging <span className="text-neon-cyan">Analyzer</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            AI-powered material recommendation using Hybrid RAG
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill
            label={demoMode ? 'Demo Mode' : 'Live Mode'}
            variant={demoMode ? 'warning' : 'success'}
            pulse
          />
          {response && (
            <NeonButton variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </NeonButton>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FoodInputForm onSubmit={handleSubmit} loading={loading} />
        </motion.div>

        {/* RIGHT — Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {/* Loading state */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard>
                  <AnalysisLoadingState />
                </GlassCard>
              </motion.div>
            )}

            {/* Error state */}
            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <ErrorBanner message={error} />
                <GlassCard className="p-8 text-center">
                  <FlaskConical className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
                  <p className="text-text-secondary text-sm">
                    Submit the form on the left to get your packaging recommendation.
                  </p>
                </GlassCard>
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && !error && !response && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="p-12 text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <FlaskConical className="w-16 h-16 text-neon-cyan/30 mx-auto mb-6" />
                  </motion.div>
                  <h3 className="font-display font-semibold text-text-primary mb-3">
                    Ready to Analyze
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                    Fill in the food properties on the left and click{' '}
                    <span className="text-neon-cyan">Analyze Packaging</span> to get your
                    AI-powered recommendation.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                    {[
                      { label: 'Materials Analyzed', value: '10' },
                      { label: 'Scoring Dimensions', value: '6' },
                      { label: 'Food Profiles', value: '30+' },
                      { label: 'Knowledge Chunks', value: '40+' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-3 rounded-xl bg-white/3 border border-white/6"
                      >
                        <p className="text-lg font-mono font-bold text-neon-cyan">
                          {stat.value}
                        </p>
                        <p className="text-xs text-text-secondary">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Results state */}
            {!loading && !error && response && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Meta info */}
                <div className="flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span>
                    Query: <span className="text-neon-cyan">{response.food_commodity}</span>
                  </span>
                  <span>{response.processing_time_ms}ms</span>
                </div>

                {/* Top recommendation */}
                <RecommendationCard
                  recommendation={response.recommendation}
                  foodCommodity={response.food_commodity}
                />

                {/* Score breakdown */}
                <ScoreBreakdownComponent
                  breakdown={response.recommendation.score_breakdown}
                />

                {/* Explanation */}
                <ExplanationPanel
                  blocks={response.recommendation.explanation}
                />

                {/* Evidence */}
                <EvidenceViewer
                  evidence={response.recommendation.evidence}
                />

                {/* Alternatives */}
                <AlternativesList alternatives={response.alternatives} />

                {/* All materials table */}
                <GlassCard className="p-5">
                  <button
                    onClick={() => setShowAllMaterials((v) => !v)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h3 className="font-display font-semibold text-text-primary">
                      All Materials Ranked
                    </h3>
                    <ChevronDown
                      className={`w-4 h-4 text-text-secondary transition-transform ${
                        showAllMaterials ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showAllMaterials && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5">
                          <AllMaterialsTable
                            materials={response.all_materials_ranked}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
