import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

interface SearchResult {
  doc_id: string
  document_name: string
  chunk_text: string
  score: number
}

interface SearchPanelProps {
  onSearch: (query: string) => Promise<SearchResult[]>
}

export default function SearchPanel({ onSearch }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const found = await onSearch(query)
      setResults(found)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="p-5">
      <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-neon-cyan" />
        Search Knowledge Base
      </h3>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for packaging materials, guidelines, regulations..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-medium text-sm hover:bg-neon-cyan/20 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary mb-3">
            Found {results.length} matching chunks
          </p>
          {results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg bg-white/3 border border-white/6"
            >
              <p className="text-xs text-neon-cyan font-mono mb-1">
                {result.document_name}
              </p>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                {result.chunk_text}
              </p>
              <span className="text-xs text-text-secondary/50 mt-2 block">
                Relevance: {(result.score * 100).toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {query && results.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-sm text-text-secondary/70">
            No results found for "{query}"
          </p>
        </div>
      )}
    </GlassCard>
  )
}
