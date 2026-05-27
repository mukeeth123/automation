import React, { useState } from 'react'
import { mockDocuments } from '../mock/data'
import { addAudit } from '../utils/storage'
import PageHeader from '../components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'

export default function DocumentClassificationPage() {
  const [selected, setSelected] = useState(() => mockDocuments[0])

  const handleSelect = (doc) => {
    setSelected(doc)
    addAudit(`Document Classifier: Inspected classification for ${doc.id}`, 'System')
  }

  // Helper for mock icons based on document type
  const getDocIcon = (type) => {
    switch (type) {
      case 'Invoices': return '📄'
      case 'Contracts': return '💼'
      case 'Legal': return '⚖️'
      case 'Receipts': return '🎟️'
      default: return '📁'
    }
  }

  return (
    <div className="page-container">
      <PageHeader title="Document Classification" subtitle="Automated categorization and semantic tagging of incoming files" />

      <div className="grid-1-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Indexed Documents</h4>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mockDocuments.map(doc => {
              const isSelected = selected?.id === doc.id
              return (
                <div 
                  key={doc.id}
                  onClick={() => handleSelect(doc)}
                  style={{ 
                    padding: 14, 
                    borderRadius: 8,
                    border: '1px solid var(--border-light)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.06)' : 'rgba(255,255,255,0.01)',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
                >
                  <span style={{ fontSize: 20 }}>{getDocIcon(doc.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#fff' : 'var(--text-primary)' }}>{doc.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                      Category: {doc.type}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {doc.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="badge" style={{ fontSize: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Classification Analysis Insights</h4>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div 
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{selected.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {selected.id}</div>
                    </div>
                    <span className="badge badge-info">{selected.type}</span>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>NLP Semantic Tags</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {selected.tags.map((t, idx) => (
                        <span key={idx} className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Semantic Extraction Summary</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(0,0,0,0.1)', padding: 14, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      {selected.summary}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Suggested Retention Policy</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>
                        {selected.type === 'Contracts' ? '7 Years (Compliance Lock)' : '3 Years (Archival standard)'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Classification Rule Triggered</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>
                        {selected.type === 'Invoices' ? 'Payables Taxonomy rule 8A' : 'Legal Docs Taxonomy rule 4'}
                      </div>
                    </div>
                  </div>

                  <details style={{ marginTop: 8 }}>
                    <summary>AI Taxonomy Reasoning</summary>
                    <div className="details-content">
                      Semantic context matched from header keywords, token structure, layout orientation, and compliance templates. Confidence level verified at 94.6% accuracy matching system dictionaries.
                    </div>
                  </details>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                  Select an indexed document to view AI categorization parameters and NLP summaries.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
