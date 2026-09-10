import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/utils/formatters'
import { useAppStore } from '@/store/appStore'
import StatusPill from '@/components/ui/StatusPill'
import { Boxes, FlaskConical, GitCompare, Database, Sliders } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home', icon: Boxes },
  { to: '/analyzer', label: 'Analyzer', icon: FlaskConical },
  { to: '/simulator', label: 'Simulator', icon: Sliders },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: Database },
]

export default function Navbar() {
  const location = useLocation()
  const { demoMode, toggleDemoMode } = useAppStore()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center">
              <span className="text-xs font-display font-bold text-white">P</span>
            </div>
            <span className="font-display font-bold text-text-primary group-hover:text-neon-cyan transition-colors">
              PackIntel <span className="text-neon-cyan">AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDemoMode}
              className="flex items-center gap-2 group"
              title="Toggle Demo Mode"
            >
              <StatusPill
                label={demoMode ? 'DEMO MODE' : 'LIVE MODE'}
                variant={demoMode ? 'warning' : 'success'}
                pulse
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
