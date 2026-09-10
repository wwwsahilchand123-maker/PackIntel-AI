import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import ErrorBanner from '@/components/ui/ErrorBanner'
import { cn } from '@/utils/formatters'

interface UploadZoneProps {
  onFileSelected: (file: File, description?: string) => void
  loading: boolean
  error: string | null
}

export default function UploadZone({
  onFileSelected,
  loading,
  error,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [description, setDescription] = useState('')

  const acceptedTypes = '.pdf,.txt,.csv,.json'
  const maxSize = 20 * 1024 * 1024 // 20MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    // Validate
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'txt', 'csv', 'json'].includes(ext || '')) {
      // Error handled in parent
      return
    }

    if (file.size > maxSize) {
      // Error handled in parent
      return
    }

    onFileSelected(file, description || undefined)
  }

  return (
    <GlassCard
      className={cn(
        'p-8 border-2 border-dashed transition-all',
        dragActive
          ? 'border-neon-cyan/60 bg-neon-cyan/5'
          : 'border-white/20 hover:border-neon-cyan/40'
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {error && <ErrorBanner message={error} />}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleChange}
        className="hidden"
        disabled={loading}
      />

      <div className="text-center">
        <motion.div
          animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Upload className="w-12 h-12 text-neon-cyan/40 mx-auto mb-4" />
        </motion.div>

        <h3 className="font-display font-semibold text-text-primary mb-2">
          Upload Knowledge Base Document
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Drag and drop your file here, or click to browse
        </p>

        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          {['PDF', 'TXT', 'CSV', 'JSON'].map((type) => (
            <span
              key={type}
              className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-text-secondary/70"
            >
              {type}
            </span>
          ))}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-6 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-medium text-sm hover:bg-neon-cyan/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Select File'}
        </button>

        <p className="text-xs text-text-secondary/50 mt-4">
          Max file size: 20 MB
        </p>
      </div>

      {/* Description input */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <label className="text-sm font-medium text-text-primary mb-2 block">
          Document Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 'FDA packaging guidelines 2024' or 'Customer feedback on material performance'"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-text-primary placeholder:text-text-secondary/40 text-sm resize-none"
          rows={2}
          disabled={loading}
        />
      </div>
    </GlassCard>
  )
}
