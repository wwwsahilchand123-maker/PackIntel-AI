import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Loader2 } from 'lucide-react'
import UploadZone from '@/components/knowledge/UploadZone'
import DocumentList from '@/components/knowledge/DocumentList'
import SearchPanel from '@/components/knowledge/SearchPanel'
import ErrorBanner from '@/components/ui/ErrorBanner'
import GlassCard from '@/components/ui/GlassCard'
import StatusPill from '@/components/ui/StatusPill'
import { materialsApi } from '@/api/materials'
import { DocumentMeta } from '@/api/materials'

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [stats, setStats] = useState({ total: 0, chunks: 0 })
  const [refreshing, setRefreshing] = useState(true)

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setRefreshing(true)
    try {
      const data = await materialsApi.getFoodProfiles() // Placeholder - would need actual KB endpoint
      // In real implementation, fetch from /api/v1/knowledge-base/documents
      setDocuments([])
    } finally {
      setRefreshing(false)
    }
  }

  const handleFileSelected = async (file: File, description?: string) => {
    setLoading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (description) formData.append('description', description)

      // Would call: await knowledgeBaseApi.upload(formData)
      // For now, simulate
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Reload documents
      await loadDocuments()
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Upload failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return

    try {
      // Would call: await knowledgeBaseApi.delete(docId)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await loadDocuments()
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Delete failed. Please try again.'
      )
    }
  }

  const handleSearch = async (query: string) => {
    // Would call: await knowledgeBaseApi.search(query)
    return []
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          Knowledge <span className="text-neon-amber">Base</span>
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Manage documents and extend the AI packaging material knowledge base.
          Upload PDFs, text files, and data to enhance recommendations.
        </p>
      </motion.div>

      {uploadError && <ErrorBanner message={uploadError} />}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {[
          { label: 'Documents', value: documents.length },
          { label: 'Chunks Indexed', value: stats.chunks },
          { label: 'Storage Used', value: '---' },
          { label: 'Last Updated', value: 'Today' },
        ].map((stat) => (
          <GlassCard key={stat.label} className="p-4 text-center">
            <p className="text-xs text-text-secondary mb-1">{stat.label}</p>
            <p className="font-display font-bold text-lg text-neon-cyan">
              {stat.value}
            </p>
          </GlassCard>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <UploadZone
            onFileSelected={handleFileSelected}
            loading={loading}
            error={uploadError}
          />
        </motion.div>

        {/* Right — Documents & Search */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Search */}
          <SearchPanel onSearch={handleSearch} />

          {/* Documents */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-text-primary flex items-center gap-2">
                <Database className="w-4 h-4 text-neon-amber" />
                Indexed Documents
              </h3>
              {refreshing && (
                <Loader2 className="w-4 h-4 text-text-secondary animate-spin" />
              )}
            </div>

            <DocumentList
              documents={documents}
              onDelete={handleDelete}
              loading={loading}
            />
          </GlassCard>

          {/* Info */}
          <GlassCard className="p-4 bg-neon-amber/5 border-neon-amber/20">
            <p className="text-xs text-text-secondary leading-relaxed">
              <span className="font-semibold text-neon-amber">ℹ️ How it works:</span>{' '}
              Documents are automatically parsed, chunked into 400-character segments with 50-char
              overlap, embedded using Sentence Transformers, and indexed in Qdrant for hybrid
              retrieval during recommendations.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
