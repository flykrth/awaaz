import React, { useState } from 'react'
import { Search, Database, Layers } from 'lucide-react'
import type { RagResultItem } from '../types'

export const RagExplorer: React.FC = () => {
  const [query, setQuery] = useState('Patna Junction Railway platform departure')
  const [dimension, setDimension] = useState('All Dimensions')
  const [topK, setTopK] = useState(3)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RagResultItem[]>([])
  const [searched, setSearched] = useState(false)
  const [allDocs, setAllDocs] = useState<any[]>([])
  const [showAllDocs, setShowAllDocs] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          dimension: dimension === 'All Dimensions' ? null : dimension,
          top_k: topK,
        }),
      })
      const data = await res.json()
      setResults(data.results || [])
      setSearched(true)
    } catch (err) {
      console.error('RAG search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFetchAllDocs = async () => {
    if (allDocs.length > 0) {
      setShowAllDocs(!showAllDocs)
      return
    }
    try {
      const res = await fetch('/api/rag/documents')
      const data = await res.json()
      setAllDocs(data.documents || [])
      setShowAllDocs(true)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Database size={22} color="#3b82f6" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
            ChromaDB Vector RAG Evidence Grounding
          </h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
          Query the embedded ChromaDB vector store across heterogeneous real-world sources
          (Police FIRs, Transit CCTV manifests, PMCH hospital triage logs, and Childline 1098 call records).
        </p>

        {/* Quick query chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', alignSelf: 'center' }}>Try query:</span>
          {[
            'Patna Junction platform departure',
            'Scar on left forearm 150cm',
            'Ranchi bus stand transit',
            'Hospital triage burn or scar mark',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
              Semantic Search Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. platform CCTV sighting..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
              Filter Dimension
            </label>
            <select value={dimension} onChange={(e) => setDimension(e.target.value)}>
              <option>All Dimensions</option>
              <option value="identity">Identity</option>
              <option value="timeline">Timeline</option>
              <option value="physical_markers">Physical Markers</option>
              <option value="origin">Origin</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
              Top K Results: <strong style={{ color: '#3b82f6' }}>{topK}</strong>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6', marginTop: '0.4rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={handleSearch} disabled={loading || !query.trim()}>
            <Search size={16} />
            {loading ? 'Searching Vector Store...' : 'Search ChromaDB Vector Store'}
          </button>
          <button className="btn-secondary" onClick={handleFetchAllDocs}>
            <Layers size={16} />
            {showAllDocs ? 'Hide Corpus Docs' : 'Browse All Corpus Documents'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#f8fafc' }}>
            Retrieved Evidence Chunks ({results.length} matches)
          </h3>

          {results.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              No matching evidence chunks found in ChromaDB vector store.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card"
                  style={{
                    borderLeft: '4px solid #3b82f6',
                    padding: '1.15rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                      Chunk #{idx + 1}: <code style={{ color: '#60a5fa' }}>{item.source_id}</code>
                    </span>
                    <span style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      Dimension: {item.dimension}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {item.chunk}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                    <span>Timestamp: <strong style={{ color: '#94a3b8' }}>{item.timestamp}</strong></span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      Cosine Similarity: {(item.score * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '2px',
                    marginTop: '0.4rem',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, item.score * 100))}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Corpus Docs Modal/Accordion */}
      {showAllDocs && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
            All Indexed Synthetic Corpus Documents ({allDocs.length} Total)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
            Pre-seeded official records spanning Bihar Police, CID Jharkhand, Varanasi Commissionerate, and Railway manifests.
          </p>

          <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {allDocs.map((doc, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <strong style={{ color: '#38bdf8' }}>{doc.source_id}</strong>
                  <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{doc.dimension}</span>
                </div>
                <p style={{ color: '#cbd5e1' }}>{doc.document}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
