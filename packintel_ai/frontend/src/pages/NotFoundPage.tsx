import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import NeonButton from '@/components/ui/NeonButton'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display font-bold text-8xl text-neon-cyan mb-4 opacity-60">
          404
        </h1>
        <p className="text-text-secondary text-xl mb-2">Sector Not Found</p>
        <p className="text-text-secondary/60 text-sm mb-8">
          The coordinates you entered do not exist in this system.
        </p>
        <Link to="/">
          <NeonButton variant="cyan">Return to Base</NeonButton>
        </Link>
      </motion.div>
    </div>
  )
}
