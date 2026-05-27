import React, { useState } from 'react'
import { mockInvoices } from '../mock/data'
import PageHeader from '../components/PageHeader'
import { addAudit } from '../utils/storage'
import { motion, AnimatePresence } from 'framer-motion'

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState(() => 
    mockInvoices.filter(i => i.gstMismatch || i.duplicate || i.status === 'Exception').slice(0, 40)
  )
  const [selected, setSelected] = useState(() => {
    // Select the first conflict by default so the preview drawer is populated immediately
    const list = mockInvoices.filter(i => i.gstMismatch || i.duplicate || i.status === 'Exception')
    return list.length > 0 ? list[0] : null
  })

  const handleAction = (id, action) => {
    setExceptions(prev => prev.filter(x => x.id !== id))
    setSelected(null)
    addAudit(`Exceptions resolution: ${action} exception for invoice ${id}`, 'Demo User')
    alert(`Exception resolved: ${action} applied to invoice ${id}!`)
  }

  const getExceptionType = (item) => {
    if (!item) return ''
    if (item.duplicate) return 'Duplicate Record'
    if (item.gstMismatch) return 'GST Mismatch'
    return 'Manual Audit Request'
  }

  return (
    <div className="page-container">
      <PageHeader title="Exception Handling Center" subtitle="Audit, review and resolve document and tax reconciliation discrepancies" />

      <div className="grid-1-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Open Exceptions Queue</span>
            <span className="badge badge-danger">{exceptions.length} Conflicts</span>
          </h4>
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Vendor</th>
                  <th>Conflict Type</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map(e => {
                  const type = getExceptionType(e)
                  const isSelected = selected?.id === e.id
                  return (
                    <tr 
                      key={e.id}
                      onClick={() => setSelected(e)}
                      style={{ 
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                        borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                        transition: 'all 150ms'
                      }}
                    >
                      <td style={{ fontWeight: 700, paddingLeft: isSelected ? 14 : 18 }}>{e.id}</td>
                      <td>{e.vendorName || e.vendorId}</td>
                      <td>
                        <span className={`badge ${
                          e.duplicate ? 'badge-danger' : e.gstMismatch ? 'badge-warning' : 'badge-info'
                        }`}>
                          {type}
                        </span>
                      </td>
                      <td>{e.currency} {e.amount.toLocaleString()}</td>
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
                            setSelected(e)
                          }}
                        >
                          {isSelected ? 'Auditing' : 'Investigate'}
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
          <h4>Discrepancy Auditor Panel</h4>
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
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.id} Conflict</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created: {new Date(selected.date).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge ${selected.duplicate ? 'badge-danger' : selected.gstMismatch ? 'badge-warning' : 'badge-info'}`}>
                      {getExceptionType(selected)}
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
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>GST Number</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>GSTIN{selected.id.split('-')[1] || '9999'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>PO Reference</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.poRef || 'No Associated PO'}</div>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Line Item / Description</div>
                      <div style={{ fontWeight: 600, marginTop: 2, color: '#fff' }}>{selected.description || '—'}</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.5, color: '#f87171' }}>
                    <strong>Conflict Reason:</strong> {
                      selected.duplicate 
                        ? 'Double transaction signature warning: The total amount, date, and vendor details match an existing ledger entry.' 
                        : selected.gstMismatch 
                          ? 'GSTIN Mismatch warning: Tax rates calculated in raw invoice scan do not match supplier portal registrations.'
                          : 'Manual compliance verify: The system requires human authorization due to variance triggers.'
                    }
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <button className="button" style={{ width: '100%' }} onClick={() => handleAction(selected.id, 'Resolved & Verified')}>
                      Force Resolve (Override Ledger)
                    </button>
                    <button 
                      className="button" 
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', boxShadow: 'none' }} 
                      onClick={() => handleAction(selected.id, 'Escalated to Vendor')}
                    >
                      Escalate to Supplier
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                  Select a flagged invoice exception from the ledger list to run conflict diagnostics, verify metadata, and apply updates.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
