import { motion } from 'framer-motion'
import { Trash2, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { DocumentMeta } from '@/api/materials'
import GlassCard from '@/components/ui/GlassCard'
import StatusPill from '@/components/ui/StatusPill'
import { formatFileSize } from '@/utils/formatters'

interface DocumentListProps {
  documents: DocumentMeta[]
  onDelete: (docId: string) => void
  loading: boolean
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'indexed':
      return { icon: CheckCircle, color: '#00FF9D', variant: 'success' as const }
    case 'processing':
      return { icon: Clock, color: '#FFB800', variant: 'warning' as const }
    case 'failed':
      return { icon: AlertCircle, color: '#FF3D3D', variant: 'error' as const }
    default:
      return { icon: FileText, color: '#8B95B0', variant: 'neutral' as const }
  }
}

export default function DocumentList({
  documents,
  onDelete,
  loading,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <FileText className="w-12 h-12 text-text-secondary/20 mx-auto mb-4" />
        <p className="text-text-secondary">No documents uploaded yet.</p>
        <p className="text-text-secondary/60 text-sm mt-1">
          Upload a PDF, TXT, CSV, or JSON file to extend the knowledge base.
        </p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc, i) => {
        const { icon: StatusIcon, variant } = getStatusConfig(doc.status)
        return (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  <h4 className="font-medium text-text-primary truncate">
                    {doc.original_name || doc.filename}
                  </h4>
                  <span className="text-xs font-mono text-text-secondary/60 flex-shrink-0">
                    {doc.file_type.toUpperCase()}
                  </span>
                </div>

                {doc.description && (
                  <p className="text-xs text-text-secondary/70 mb-2 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary/60">
                  <span>{formatFileSize(doc.file_size_bytes || 0)}</span>
                  <span>•</span>
                  <span>{doc.chunk_count} chunks</span>
                  {doc.indexed_at && (
                    <>
                      <span>•</span>
                      <span>
                        Indexed {new Date(doc.indexed_at).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusPill
                  label={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  variant={variant}
                  pulse={doc.status === 'processing'}
                />
                {doc.status === 'indexed' && (
                  <button
                    onClick={() => onDelete(doc.id)}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-neon-red/10 text-neon-red/60 hover:text-neon-red transition-colors disabled:opacity-50"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )
      })}
    </div>
  )
}
