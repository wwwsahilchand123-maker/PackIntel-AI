import { motion } from 'framer-motion'

interface LoadingOrbProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { orb: 'w-12 h-12', ring1: 'w-16 h-16', ring2: 'w-20 h-20' },
  md: { orb: 'w-16 h-16', ring1: 'w-24 h-24', ring2: 'w-32 h-32' },
  lg: { orb: 'w-24 h-24', ring1: 'w-36 h-36', ring2: 'w-48 h-48' },
}

export default function LoadingOrb({ message = 'Processing...', size = 'md' }: LoadingOrbProps) {
  const s = sizeMap[size]

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className={`absolute ${s.ring2} rounded-full border border-neon-violet/20`}
          style={{
            borderTopColor: 'rgba(123, 47, 255, 0.6)',
          }}
        />
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className={`absolute ${s.ring1} rounded-full border border-neon-cyan/20`}
          style={{
            borderTopColor: 'rgba(0, 212, 255, 0.6)',
            borderRightColor: 'rgba(0, 212, 255, 0.3)',
          }}
        />
        {/* Core orb */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(0, 212, 255, 0.4)',
              '0 0 40px rgba(0, 212, 255, 0.8)',
              '0 0 20px rgba(0, 212, 255, 0.4)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`${s.orb} rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-violet/30 backdrop-blur-sm border border-neon-cyan/40 flex items-center justify-center`}
        >
          <motion.div
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1/2 h-1/2 rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet opacity-80"
          />
        </motion.div>
      </div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-sm font-mono text-text-secondary"
      >
        {message}
      </motion.p>
    </div>
  )
}
