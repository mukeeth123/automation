import React, { useState, useEffect } from 'react'
import { mockEmails } from '../mock/data'
import { addAudit } from '../utils/storage'
import PageHeader from '../components/PageHeader'
import { motion, AnimatePresence } from 'framer-motion'

export default function EmailAutomationPage() {
  const [emails, setEmails] = useState(() => mockEmails)
  const [selected, setSelected] = useState(() => mockEmails[0])
  const [simulating, setSimulating] = useState(false)
  const [sendingManual, setSendingManual] = useState(false)
  const [sendingId, setSendingId] = useState(null)

  // Composer fields for the selected email
  const [editTo, setEditTo] = useState('mukeethr67@gmail.com')
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')

  const getEmailBody = (email) => {
    if (!email) return ''
    const sign = `\n\nRegards,\nPierian Finance Team\nOpsHub | accounts@pierian.ai`
    switch(email.category) {
      case 'Approval Request':
        return `Hello Vendor Partner,\n\nThis is an automated notification from Pierian Finance Team via OpsHub.\nWe have received your document for processing. Invoice details are currently under internal manager review. No immediate action is required on your side.\n\nStatus: Pending Internal Approval\nInvoice Link: https://opshub.ai/public/invoice/${email.id}${sign}`
      case 'Reminder':
        return `Dear Partner,\n\nWe noticed a mismatch between invoice amount and PO amount. Some matching fields or tax details require your attention. Please review PO Line match suggestions at your earliest to expedite payment clearance.${sign}`
      case 'Escalation':
        return `URGENT: Transaction Conflict Warning\n\nTo Whom It May Concern,\n\nInvoice verification has failed due to a duplicate tax submission mismatch. The Pierian Finance Team has escalated this dispute. Please provide supporting tax receipt documents as soon as possible.\n\nTicket Ref ID: AP-${email.id}${sign}`
      default:
        return `Dear Partner,\n\nWe have updated the processing timeline for your accounts payable ledger entry. The system has automatically matched this record with internal systems.\n\nKindly review and share the corrected invoice or confirmation.${sign}`
    }
  }

  // Sync composer input fields with the selected email
  useEffect(() => {
    if (selected) {
      setEditTo(selected.to === 'vendor@partner.com' || selected.to === 'finance@opshub.ai' ? 'mukeethr67@gmail.com' : selected.to)
      setEditSubject(selected.subject)
      setEditBody(getEmailBody(selected))
    }
  }, [selected])

  const sendTest = () => {
    setSimulating(true)
    const now = new Date().toISOString()
    const categories = ['Approval Request', 'Reminder', 'Escalation', 'Vendor Follow-up']
    const cat = categories[Math.floor(Math.random() * categories.length)]
    const invNum = Math.floor(1000 + Math.random() * 500)
    
    const next = {
      id: `EMAIL-${Date.now()}`,
      from: 'accounts@pierian.ai',
      to: 'vendor@partner.com',
      subject: `${cat} for INV-${invNum}`,
      status: 'Sent',
      timestamp: now,
      category: cat
    }
    
    fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'mukeethr67@gmail.com',
        subject: `[Pierian Finance] ${cat} for INV-${invNum}`,
        text: getEmailBody(next)
      })
    })
    .then(res => res.json())
    .then(data => {
      setSimulating(false)
      setEmails(prev => [next, ...prev])
      setSelected(next)
      if (data.ok) {
        addAudit(`Email Automation: Dispatched automated email alert to mukeethr67@gmail.com`, 'System')
        alert(`Success! Real email dispatched to mukeethr67@gmail.com. Message ID: ${data.messageId}`)
      } else {
        addAudit(`Email Automation Error: Email Server returned failure: ${data.error}`, 'System')
        alert(`Email Server connection success, but sending failed: ${data.error}`)
      }
    })
    .catch(err => {
      setSimulating(false)
      setEmails(prev => [next, ...prev])
      setSelected(next)
      console.error('Email API call failed, falling back to mock send:', err)
      addAudit(`Email Automation: Dispatched simulated email (Local Email Server offline)`, 'System')
      alert(`Simulated email added to UI queue (Email Server offline).`)
    })
  }

  // Send an email directly from the ledger item list (manual send option on every mail)
  const sendDirect = (email) => {
    setSendingId(email.id)
    const targetRecipient = email.to === 'vendor@partner.com' || email.to === 'finance@opshub.ai' ? 'mukeethr67@gmail.com' : email.to

    fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: targetRecipient,
        subject: `[Manual Send] ${email.subject}`,
        text: getEmailBody(email)
      })
    })
    .then(res => res.json())
    .then(data => {
      setSendingId(null)
      if (data.ok) {
        addAudit(`Email Automation: Manually dispatched email ${email.id} to ${targetRecipient}`, 'Demo User')
        alert(`Success! Email "${email.subject}" has been manually sent to ${targetRecipient}!`)
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, status: 'Sent' } : e))
        if (selected?.id === email.id) {
          setSelected(prev => ({ ...prev, status: 'Sent' }))
        }
      } else {
        alert(`Email Dispatch Failed: ${data.error}`)
      }
    })
    .catch(err => {
      setSendingId(null)
      console.error('Email API call failed:', err)
      alert('Failed to connect to the email server.')
    })
  }

  const sendManualEmail = () => {
    if (!selected) return
    setSendingManual(true)

    fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: editTo,
        subject: editSubject,
        text: editBody
      })
    })
    .then(res => res.json())
    .then(data => {
      setSendingManual(false)
      if (data.ok) {
        addAudit(`Email Automation: Manually composed email dispatched for ${selected.id} to ${editTo}`, 'Demo User')
        alert(`Success! Emailed "${editSubject}" manually to ${editTo}!`)
        setEmails(prev => prev.map(e => e.id === selected.id ? { ...e, status: 'Sent' } : e))
        setSelected(prev => ({ ...prev, status: 'Sent' }))
      } else {
        alert(`Email Dispatch Failed: ${data.error}`)
      }
    })
    .catch(err => {
      setSendingManual(false)
      console.error('Email API call failed:', err)
      alert('Failed to connect to the email server.')
    })
  }

  const headerActions = (
    <button className="button" onClick={sendTest} disabled={simulating}>
      {simulating ? 'Sending Email...' : 'Trigger Automated Email'}
    </button>
  )

  return (
    <div className="page-container">
      <PageHeader title="Email Automation Panel" subtitle="Monitor and trigger AI-driven partner communications" actions={headerActions} />

      <div className="grid-1-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Communication Ledger</h4>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {emails.map(email => {
                const isSelected = selected?.id === email.id
                const isSent = email.status === 'Sent'
                
                return (
                  <motion.div 
                    key={email.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelected(email)}
                    style={{ 
                      padding: 14, 
                      borderRadius: 8,
                      border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-light)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      transition: 'all 150ms'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>{email.category}</span>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span className={`badge ${isSent ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 9 }}>
                          {email.status}
                        </span>
                        <button
                          className="button"
                          disabled={sendingId === email.id}
                          style={{
                            padding: '3px 8px',
                            fontSize: 9,
                            margin: 0,
                            height: 'auto',
                            background: isSent ? 'rgba(255, 255, 255, 0.04)' : 'linear-gradient(90deg, #10b981, #059669)',
                            border: isSent ? '1px solid var(--border-light)' : 'none',
                            color: isSent ? 'var(--text-secondary)' : '#fff',
                            borderRadius: 4
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            sendDirect(email)
                          }}
                        >
                          {sendingId === email.id ? 'Sending...' : isSent ? 'Resend' : 'Send'}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: isSelected ? '#fff' : 'var(--text-primary)' }}>{email.subject}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                      {email.from} → {email.to}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>
                      {new Date(email.timestamp).toLocaleString()}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Email Details & Dispatch Composer</h4>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div 
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}
                >
                  <div style={{ background: 'rgba(0,0,0,0.15)', padding: 16, borderRadius: 8, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, width: 60 }}>To:</span>
                      <input 
                        type="email" 
                        className="form-input" 
                        style={{ padding: '6px 10px', fontSize: 12, margin: 0, flex: 1 }} 
                        value={editTo} 
                        onChange={(e) => setEditTo(e.target.value)} 
                        placeholder="recipient@example.com"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12, width: 60 }}>Subject:</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ padding: '6px 10px', fontSize: 12, margin: 0, flex: 1 }} 
                        value={editSubject} 
                        onChange={(e) => setEditSubject(e.target.value)} 
                      />
                    </div>
                    <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: 10, marginTop: 4 }}>
                      <div><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>From:</span> {selected.from}</div>
                      <div><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span> {selected.category}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>Email Body Content</span>
                    <textarea 
                      className="form-input" 
                      style={{ 
                        flex: 1, 
                        minHeight: 180, 
                        fontFamily: 'monospace', 
                        fontSize: 12, 
                        color: 'var(--text-secondary)', 
                        lineHeight: 1.6,
                        padding: 12,
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-light)',
                        resize: 'none'
                      }}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                    />
                  </div>

                  {/* Manual Send Outgoing Mail option */}
                  <button 
                    className="button" 
                    style={{ width: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '12px', fontWeight: 600 }}
                    onClick={sendManualEmail}
                    disabled={sendingManual}
                  >
                    {sendingManual ? 'Sending Outbox...' : 'Manually Dispatch Composed Email'}
                  </button>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                  Select an email ledger from the log to view the transmission body details.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
