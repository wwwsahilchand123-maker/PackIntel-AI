import { cn } from '@/utils/formatters'

interface StatusPillProps {
  label: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  pulse?: boolean
}

const variantMap = {
  success: 'bg-neon-green/10 text-neon-green border-neon-green/30',
  warning: 'bg-neon-amber/10 text-neon-amber border-neon-amber/30',
  error: 'bg-neon-red/10 text-neon-red border-neon-red/30',
  info: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30',
  neutral: 'bg-white/5 text-text-secondary border-white/10',
}

const pulseMap = {
  success: 'bg-neon-green',
  warning: 'bg-neon-amber',
  error: 'bg-neon-red',
  info: 'bg-neon-cyan',
  neutral: 'bg-text-secondary',
}

export default function StatusPill({ label, variant = 'info', pulse = false }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border',
        variantMap[variant]
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulseMap[variant]
            )}
          />
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', pulseMap[variant])} />
        </span>
      )}
      {label}
    </span>
  )
}
