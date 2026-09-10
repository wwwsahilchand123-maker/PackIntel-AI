import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import LoadingOrb from '@/components/ui/LoadingOrb'

const STEPS = [
  { label: 'Embedding query vector...', duration: 600 },
  { label: 'Searching knowledge base...', duration: 700 },
  { label: 'Running BM25 keyword retrieval...', duration: 500 },
  { label: 'Fusing results via RRF...', duration: 400 },
  { label: 'Scoring all materials...', duration: 600 },
  { label: 'Generating explanation...', duration: 500 },
  { label: 'Building recommendation...', duration: 300 },
]

export default function AnalysisLoadingState() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    let step = 0

    const advance = () => {
      if (step < STEPS.length - 1) {
        setCompletedSteps((prev) => [...prev, step])
        step++
        setCurrentStep(step)
        setTimeout(advance, STEPS[step].duration)
      }
    }

    const initial = setTimeout(advance, STEPS[0].duration)
    return () => clearTimeout(initial)
  }, [])

  return (
    <div className="flex flex-col items-center py-12">
      <LoadingOrb message={STEPS[currentStep]?.label} size="lg" />

      <div className="mt-8 w-full max-w-xs space-y-2">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(i)
          const isCurrent = i === currentStep
          const isPending = i > currentStep

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 rounded-full bg-neon-green/20 flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-neon-green" />
                  </motion.div>
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse mx-auto" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10 mx-auto" />
                )}
              </div>
              <span
                className={`text-xs font-mono transition-colors ${
                  isCompleted
                    ? 'text-neon-green/70'
                    : isCurrent
                    ? 'text-neon-cyan'
                    : 'text-text-secondary/30'
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
