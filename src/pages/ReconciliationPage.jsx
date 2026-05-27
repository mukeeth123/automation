import React, { useState } from 'react'
import { mockInvoices, mockERPSystems } from '../mock/data'
import { addAudit } from '../utils/storage'
import PageHeader from '../components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'

function scoreMatch(inv) {
  if (inv.duplicate) return { status: 'Duplicate', score: 92 }
  if (!inv.matchedERP) return { status: 'Exception', score: 40 }
  if (inv.poRef) return { status: 'Matched', score: 98 }
  return { status: 'Partial Match', score: 75 }
}

export default function ReconciliationPage() {
  const [items] = useState(() => mockInvoices.slice(0, 80))
  const [selected, setSelected] = useState(() => {
    // Default select the first item so the view is populated immediately and beautifully
    const first = mockInvoices[0]
    const r = scoreMatch(first)
    return {
      inv: first,
      analysis: r,
      recommendation: r.status === 'Matched' 
        ? 'Fully reconciled. No manual action required.' 
        : r.status === 'Duplicate'
          ? 'Mark duplicate, cancel transaction and notify vendor.'
          : r.status === 'Partial Match'
            ? 'Verify PO lines and manually adjust variances.'
            : 'Escalate to vendor manager: no matching ERP ledger record found.'
    }
  })
  const [syncing, setSyncing] = useState(null)

  const runMatch = (inv) => {
    const r = scoreMatch(inv)
    setSelected({
      inv,
      analysis: r,
      recommendation: r.status === 'Matched' 
        ? 'Fully reconciled. No manual action required.' 
        : r.status === 'Duplicate'
          ? 'Mark duplicate, cancel transaction and notify vendor.'
          : r.status === 'Partial Match'
            ? 'Verify PO lines and manually adjust variances.'
            : 'Escalate to vendor manager: no matching ERP ledger record found.'
    })
    addAudit(`Executed ledger reconciliation for ${inv.id} => ${r.status}`, 'System')
  }

  const triggerSync = (name) => {
    setSyncing(name)
    setTimeout(() => {
      setSyncing(null)
      addAudit(`ERP Sync triggered: ${name}`, 'Admin')
      alert(`Ledger sync completed for ${name} database. All tables updated successfully.`)
    }, 1200)
  }

  return (
    <div className="page-container">
      <PageHeader title="Reconciliation Engine" subtitle="Verify invoices against ERP ledgers and purchase orders" />

      <div className="grid-1-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Matching Queue</h4>
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Matching</th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => {
                  const isSelected = selected?.inv.id === i.id
                  return (
                    <tr 
                      key={i.id} 
                      onClick={() => runMatch(i)}
                      style={{ 
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                        borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                        transition: 'all 150ms'
                      }}
                    >
                      <td style={{ fontWeight: 700, paddingLeft: isSelected ? 14 : 18 }}>{i.id}</td>
                      <td>{i.vendorName || i.vendorId}</td>
                      <td>{i.currency} {i.amount.toLocaleString()}</td>
                      <td>
                        <button 
                          className="button" 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '11px',
                            background: isSelected ? 'linear-gradient(90deg, #10b981, #059669)' : 'var(--accent-gradient)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: 4
                          }}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            runMatch(i);
                          }}
                        >
                          {isSelected ? 'Active' : 'Compare'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h4>Rule Engine & ERP Sync</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mockERPSystems.map(s => {
                const isSyncing = syncing === s.name
                return (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Last sync: {s.lastSync ? new Date(s.lastSync).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className={`badge ${s.connected ? 'badge-success' : 'badge-danger'}`}>
                        {s.connected ? 'Active' : 'Offline'}
                      </span>
                      <button 
                        className="button" 
                        style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', boxShadow: 'none' }}
                        onClick={() => triggerSync(s.name)}
                        disabled={isSyncing}
                      >
                        {isSyncing ? 'Syncing...' : 'Sync'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card" style={{ flex: 1, minHeight: 280, display: 'flex', flexDirection: 'column' }}>
            <h4>Ledger Verification Insight</h4>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div 
                    key={selected.inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16 }}>{selected.inv.id} Match Breakdown</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{selected.inv.vendorName} ({selected.inv.vendorId})</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Score:</span>
                        <span style={{ 
                          fontWeight: 800, 
                          color: selected.analysis.score > 85 ? 'var(--color-success)' : selected.analysis.score > 60 ? 'var(--color-warning)' : 'var(--color-danger)'
                        }}>
                          {selected.analysis.score}%
                        </span>
                      </div>
                    </div>Base

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice Document</div>
                        <div style={{ fontWeight: 700, marginTop: 4, fontSize: 12 }}>INR {selected.inv.amount.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>PO Ref: {selected.inv.poRef || 'N/A'}</div>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: 12 }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ERP Ledger Record</div>
                        <div style={{ fontWeight: 700, marginTop: 4, fontSize: 12 }}>
                          {selected.inv.matchedERP ? `INR ${selected.inv.amount.toLocaleString()}` : 'No Record Found'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          Status: {selected.inv.matchedERP ? 'Reconciliation Lock' : 'Open Entry'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Rule Engine Recommendation</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selected.recommendation}</div>
                    </div>

                    <details>
                      <summary>AI Match Breakdown Reasoning</summary>
                      <div className="details-content">
                        Checking fields: vendor name verification, tax amount cross-check, duplicate identification, and currency mapping. Confidence level score is based on the verified parameters.
                      </div>
                    </details>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: 20, flex: 1 }}>
                    Select an invoice from the comparison queue to check transaction records, compare metadata side-by-side, and run reconciliation rules.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
