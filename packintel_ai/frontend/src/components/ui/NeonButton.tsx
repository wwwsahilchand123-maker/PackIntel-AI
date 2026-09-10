import { motion } from 'framer-motion'
import { cn } from '@/utils/formatters'
import { Loader2 } from 'lucide-react'

interface NeonButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'cyan' | 'violet' | 'green' | 'amber' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
}

const variantMap = {
  cyan: 'bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-neon-cyan hover:border-neon-cyan',
  violet: 'bg-neon-violet/10 border-neon-violet/50 text-neon-violet hover:bg-neon-violet/20 hover:shadow-neon-violet hover:border-neon-violet',
  green: 'bg-neon-green/10 border-neon-green/50 text-neon-green hover:bg-neon-green/20 hover:shadow-neon-green hover:border-neon-green',
  amber: 'bg-neon-amber/10 border-neon-amber/50 text-neon-amber hover:bg-neon-amber/20 hover:shadow-neon-amber hover:border-neon-amber',
  ghost: 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10 hover:text-text-primary',
}

const sizeMap = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export default function NeonButton({
  children,
  onClick,
  type = 'button',
  variant = 'cyan',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  fullWidth = false,
}: NeonButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'border rounded-xl font-display font-medium',
        'transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
}
