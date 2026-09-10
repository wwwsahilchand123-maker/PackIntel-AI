import { motion } from 'framer-motion'
import { cn } from '@/utils/formatters'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  neon?: 'cyan' | 'violet' | 'green' | 'amber'
  onClick?: () => void
}

const neonMap = {
  cyan: 'hover:border-cyan-400/40 hover:shadow-neon-cyan',
  violet: 'hover:border-violet-400/40 hover:shadow-neon-violet',
  green: 'hover:border-emerald-400/40 hover:shadow-neon-green',
  amber: 'hover:border-amber-400/40 hover:shadow-neon-amber',
}

export default function GlassCard({
  children,
  className,
  hover = false,
  neon,
  onClick,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'glass rounded-2xl p-6',
        hover && 'cursor-pointer transition-all duration-300',
        neon && neonMap[neon],
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}
