import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, RotateCcw, Zap } from 'lucide-react'
import ConditionSliders from '@/components/simulator/ConditionSliders'
import DeltaViewer from '@/components/simulator/DeltaViewer'
import AnalysisLoadingState from '@/components/recommendation/AnalysisLoadingState'
import RecommendationCard from '@/components/recommendation/RecommendationCard'
import ErrorBanner from '@/components/ui/ErrorBanner'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'
import { useSimulator } from '@/hooks/useSimulator'
import { useAppStore } from '@/store/appStore'
import { simulateApi } from '@/api/simulate'
import { RecommendRequest } from '@/types/recommendation'

export default function SimulatorPage() {
  const { demoMode } = useAppStore()
  const {
    beforeConditions,
    afterConditions,
    beforeResult,
    afterResult,
    changesSummary,
    loading,
    error,
    setBeforeConditions,
    setAfterConditions,
    runComparison,
  } = useSimulator()

  const [localError, setLocalError] = useState<string | null>(null)

  // Initialize from analyzer if there's a saved result
  useEffect(() => {
    if (!beforeConditions.food_commodity) {
      setBeforeConditions({
        food_commodity: 'Fresh Tomatoes',
        moisture_sensitivity: 7,
        oxygen_sensitivity: 6,
        temperature_min: 2,
        temperature_max: 8,
        shelf_life_days: 14,
        sustainability_preference: 'medium',
      })
      setAfterConditions({
        food_commodity: 'Fresh Tomatoes',
        moisture_sensitivity: 7,
        oxygen_sensitivity: 6,
        temperature_min: 2,
        temperature_max: 8,
        shelf_life_days: 14,
        sustainability_preference: 'medium',
      })
    }
  }, [])

  const handleReset = () => {
    setAfterConditions({
      food_commodity: beforeConditions.food_commodity,
      moisture_sensitivity: beforeConditions.moisture_sensitivity,
      oxygen_sensitivity: beforeConditions.oxygen_sensitivity,
      temperature_min: beforeConditions.temperature_min,
      temperature_max: beforeConditions.temperature_max,
      shelf_life_days: beforeConditions.shelf_life_days,
      sustainability_preference: beforeConditions.sustainability_preference,
    })
  }

  const hasChanges =
    JSON.stringify(beforeConditions) !== JSON.stringify(afterConditions)

  const handleAnalyze = async () => {
    if (!hasChanges) {
      setLocalError('Change at least one condition to run a simulation.')
      setTimeout(() => setLocalError(null), 5000)
      return
    }
    await runComparison()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          What-If <span className="text-neon-violet">Simulator</span>
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Change packaging conditions and instantly see how recommendations shift.
          Perfect for exploring trade-offs and optimizations.
        </p>
      </motion.div>

      {/* Error banner */}
      {(error || localError) && (
        <ErrorBanner
          message={error || localError || ''}
          onDismiss={() => setLocalError(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Before */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ConditionSliders
            title="Current Conditions"
            icon={<Sliders className="w-4 h-4 text-neon-violet" />}
            conditions={beforeConditions}
            onChange={(field, value) => {
              setBeforeConditions({ [field]: value })
              // Also update after conditions on first set
              if (!beforeResult && !afterResult) {
                setAfterConditions({ [field]: value })
              }
            }}
          />

          {beforeResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <p className="text-xs text-text-secondary mb-3 font-mono uppercase">
                Top Recommendation
              </p>
              <RecommendationCard
                recommendation={beforeResult.recommendation}
                foodCommodity={beforeResult.food_commodity}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Right — After */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ConditionSliders
            title="Modified Conditions"
            icon={<Zap className="w-4 h-4 text-neon-amber" />}
            conditions={afterConditions}
            onChange={(field, value) => {
              setAfterConditions({ [field]: value })
            }}
          />

          {afterResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <p className="text-xs text-text-secondary mb-3 font-mono uppercase">
                New Recommendation
              </p>
              <RecommendationCard
                recommendation={afterResult.recommendation}
                foodCommodity={afterResult.food_commodity}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Bottom — Compare button & results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        {/* Action buttons */}
        <div className="flex gap-3 mb-8 justify-center">
          <NeonButton
            variant="violet"
            size="lg"
            onClick={handleAnalyze}
            loading={loading}
            disabled={loading || !hasChanges}
          >
            <Zap className="w-5 h-5" />
            {loading ? 'Comparing...' : 'Run Comparison'}
          </NeonButton>

          {hasChanges && (
            <NeonButton variant="ghost" size="lg" onClick={handleReset}>
              <RotateCcw className="w-5 h-5" />
              Reset After
            </NeonButton>
          )}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
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

          {!loading && beforeResult && afterResult && changesSummary && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <DeltaViewer
                beforeMaterial={beforeResult.recommendation.material.name}
                afterMaterial={afterResult.recommendation.material.name}
                beforeScore={beforeResult.recommendation.compatibility_score}
                afterScore={afterResult.recommendation.compatibility_score}
                scoreDelta={changesSummary.score_change}
                changed={changesSummary.changed}
                summary={changesSummary.summary}
              />
            </motion.div>
          )}

          {!loading && !beforeResult && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard className="p-12 text-center">
                <Sliders className="w-16 h-16 text-neon-violet/20 mx-auto mb-6" />
                <h3 className="font-display font-semibold text-text-primary mb-2">
                  Adjust conditions to begin
                </h3>
                <p className="text-text-secondary text-sm max-w-xs mx-auto">
                  Modify conditions on the right panel and click{' '}
                  <span className="text-neon-violet">Run Comparison</span> to see how your
                  recommendation changes.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
