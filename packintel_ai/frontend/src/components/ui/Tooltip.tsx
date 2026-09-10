import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'

interface TooltipProps {
  content: string
  children?: React.ReactNode
  showIcon?: boolean
}

export default function Tooltip({ content, children, showIcon = true }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {showIcon && (
        <Info className="w-3.5 h-3.5 text-text-secondary/50 ml-1 cursor-help" />
      )}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56"
          >
            <div className="glass-strong rounded-xl p-3 text-xs text-text-secondary leading-relaxed shadow-glass">
              {content}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
