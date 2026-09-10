import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const [visible, setVisible] = useState(true)

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-neon-red/10 border border-neon-red/30 text-neon-red"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-sm">{message}</p>
          {onDismiss && (
            <button onClick={handleDismiss} className="flex-shrink-0 hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
