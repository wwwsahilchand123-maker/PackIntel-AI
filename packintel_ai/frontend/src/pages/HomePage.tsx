import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FlaskConical, Sliders, GitCompare, Database, ArrowRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import { APP_NAME } from '@/utils/constants'

const features = [
  {
    icon: FlaskConical,
    title: 'AI Analyzer',
    description: 'Input food properties and get ranked packaging material recommendations with transparent scoring.',
    to: '/analyzer',
    neon: 'cyan' as const,
  },
  {
    icon: Sliders,
    title: 'What-If Simulator',
    description: 'Change conditions dynamically and watch the recommendation update in real-time.',
    to: '/simulator',
    neon: 'violet' as const,
  },
  {
    icon: GitCompare,
    title: 'Material Comparer',
    description: 'Side-by-side comparison of up to 5 packaging materials with charts and heatmaps.',
    to: '/compare',
    neon: 'green' as const,
  },
  {
    icon: Database,
    title: 'Knowledge Base',
    description: 'Upload PDF, TXT, CSV and JSON documents to extend the AI knowledge base.',
    to: '/knowledge-base',
    neon: 'amber' as const,
  },
]

const materials = ['PET', 'HDPE', 'LDPE', 'PP', 'Glass', 'Aluminum', 'Paperboard', 'PLA', 'PHA', 'Multilayer']

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Hero */}
      <div className="text-center mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-cyan/20 text-neon-cyan text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            Hybrid RAG · Vector Search · AI-Powered
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Pack<span className="text-neon-cyan">Intel</span>{' '}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="text-text-secondary text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Intelligent food packaging material recommendation powered by Hybrid RAG.
            Select your food, set the properties, and get science-backed packaging decisions.
          </p>

          <Link to="/analyzer">
            <NeonButton size="lg" variant="cyan">
              Start Analysis
              <ArrowRight className="w-5 h-5" />
            </NeonButton>
          </Link>
        </motion.div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link to={f.to}>
              <GlassCard hover neon={f.neon} className="h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${f.neon === 'cyan' ? 'bg-neon-cyan/10 text-neon-cyan' :
                      f.neon === 'violet' ? 'bg-neon-violet/10 text-neon-violet' :
                      f.neon === 'green' ? 'bg-neon-green/10 text-neon-green' :
                      'bg-neon-amber/10 text-neon-amber'}`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-text-primary mb-2">{f.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Materials strip */}
      <div className="glass rounded-2xl p-6">
        <p className="text-center text-text-secondary text-xs font-mono uppercase tracking-widest mb-4">
          Supported Packaging Materials
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {materials.map((m) => (
            <span
              key={m}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-text-secondary text-sm font-mono hover:text-neon-cyan hover:border-neon-cyan/30 transition-colors"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
