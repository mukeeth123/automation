import React, { useState } from 'react'
import { mockInvoices } from '../mock/data'
import { addAudit } from '../utils/storage'
import PageHeader from '../components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'

export default function ApprovalsPage() {
  const [queue, setQueue] = useState(() => mockInvoices.filter(i => i.status === 'Pending Approval').slice(0, 40))
  const [selected, setSelected] = useState(() => {
    // Default select the first pending approval item so the view is populated immediately
    const pendingList = mockInvoices.filter(i => i.status === 'Pending Approval')
    return pendingList.length > 0 ? pendingList[0] : null
  })

  const handleAction = (id, action) => {
    setQueue(prev => prev.filter(x => x.id !== id))
    setSelected(null)
    addAudit(`Approvals manager: ${action} invoice ${id}`, 'Demo User')
    alert(`Invoice ${id} has been successfully ${action.toLowerCase()}!`)
  }

  // Determine priority badge
  const isHighPriority = (item) => {
    if (!item) return false
    return item.amount > 500000 || item.confidence < 80
  }

  return (
    <div className="page-container">
      <PageHeader title="Approval Queue" subtitle="Verify and authorize pending payments and ledger approvals" />
      
      <div className="grid-1-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Pending Approvals Queue</span>
            <span className="badge badge-info">{queue.length} Pending</span>
          </h4>
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(i => {
                  const isHigh = isHighPriority(i)
                  const isSelected = selected?.id === i.id
                  return (
                    <tr 
                      key={i.id}
                      onClick={() => setSelected(i)}
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
                        <span className={`badge ${isHigh ? 'badge-danger' : 'badge-success'}`}>
                          {isHigh ? 'High' : 'Normal'}
                        </span>
                      </td>
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
                            evt.stopPropagation()
                            setSelected(i)
                          }}
                        >
                          {isSelected ? 'Verifying' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Approval Authorization Drawer</h4>
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
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.id}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Date: {new Date(selected.date).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge ${isHighPriority(selected) ? 'badge-danger' : 'badge-success'}`}>
                      {isHighPriority(selected) ? 'High Priority' : 'Normal Priority'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Vendor ID</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.vendorId}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Vendor Name</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.vendorName || '—'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Total Amount</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.currency} {selected.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Extraction Confidence</div>
                      <div style={{ fontWeight: 600, marginTop: 2, color: selected.confidence > 85 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {selected.confidence}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>PO Reference</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.poRef || 'N/A'}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Line Item / Description</div>
                      <div style={{ fontWeight: 600, marginTop: 2, color: '#fff' }}>{selected.description || '—'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    <button className="button" style={{ width: '100%' }} onClick={() => handleAction(selected.id, 'Approved')}>
                      Approve & Release Payment
                    </button>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button 
                        className="button" 
                        style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', boxShadow: 'none' }} 
                        onClick={() => handleAction(selected.id, 'Escalated')}
                      >
                        Escalate
                      </button>
                      <button 
                        className="button" 
                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', boxShadow: 'none' }} 
                        onClick={() => handleAction(selected.id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  <details style={{ marginTop: 8 }}>
                    <summary>Compliance Verification Checklist</summary>
                    <div className="details-content" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Double Payment Check:</span>
                        <span style={{ color: selected.duplicate ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                          {selected.duplicate ? 'Warning: Duplicate' : 'Passed'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>GSTIN Status:</span>
                        <span style={{ color: selected.gstMismatch ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                          {selected.gstMismatch ? 'Mismatch Flag' : 'Verified'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>ERP Ledger Lock:</span>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Ready</span>
                      </div>
                    </div>
                  </details>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                  Select an invoice from the pending approvals queue to check compliance, verify metadata, and authorize transactions.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
