import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { motion } from 'framer-motion'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/5 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <main className="pt-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
