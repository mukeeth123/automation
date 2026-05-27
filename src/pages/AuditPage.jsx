import React, { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { getAudits, clearAudits } from '../utils/storage'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuditPage() {
  const [logs, setLogs] = useState(() => getAudits())

  const handleClear = () => {
    if (window.confirm('Are you sure you want to wipe the audit trails?')) {
      clearAudits()
      setLogs([])
    }
  }

  // Helper for user tag levels
  const getUserBadgeClass = (user) => {
    switch (user) {
      case 'System': return 'badge-info'
      case 'Admin': return 'badge-warning'
      default: return 'badge-success'
    }
  }

  const headerActions = logs.length > 0 && (
    <button 
      className="button" 
      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', boxShadow: 'none' }}
      onClick={handleClear}
    >
      Clear Log Trails
    </button>
  )

  return (
    <div className="page-container">
      <PageHeader title="Audit & Compliance" subtitle="System event ledger tracking compliance actions and machine learning operations" actions={headerActions} />

      <div className="card" style={{ marginTop: 8, height: 600, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Compliance Timeline</span>
          <span className="badge badge-info">{logs.length} Logged Events</span>
        </h4>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {logs.map((l, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{l.action}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Timestamp: {new Date(l.time).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Operator:</span>
                  <span className={`badge ${getUserBadgeClass(l.user)}`}>
                    {l.user}
                  </span>
                </div>
              </motion.div>
            ))}
            {logs.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontSize: 13, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                The compliance log trail is empty. System actions will be recorded here.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
