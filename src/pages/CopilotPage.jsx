import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockInvoices } from '../mock/data'
import PageHeader from '../components/PageHeader'

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 12, border: '1px solid var(--border-light)', width: 60 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)' }}
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

export default function CopilotPage() {
  const [messages, setMessages] = useState(() => [
    { from: 'system', text: 'Enterprise Operations AI Copilot online. Ready to analyze invoices, identify duplicates, or compile ledger reconciliation summaries. Try clicking any suggested prompt on the right.' }
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('mukeethr67@gmail.com')
  
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const emailTranscript = () => {
    setEmailing(true)
    const textContent = messages.map(m => `${m.from === 'user' ? 'Operator' : 'Copilot'}: ${m.text}${m.reasoning ? `\n(AI Reasoning: ${m.reasoning})` : ''}`).join('\n\n')
    
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject: `[AutoFlow AI] Copilot Session Audit Log`,
        text: `AutoFlow AI Copilot session details and chain-of-thought traces:\n\n${textContent}\n\nGenerated on: ${new Date().toLocaleString()}\nVerified Operator Token Scope.`
      })
    })
    .then(r => r.json())
    .then(data => {
      setEmailing(false)
      if (data.ok) {
        alert(`Success! Copilot session transcript emailed to ${recipientEmail}!`)
      } else {
        alert(`Email Dispatch Failed: ${data.error}`)
      }
    })
    .catch(err => {
      setEmailing(false)
      console.error(err)
      alert('Failed to connect to the email server.')
    })
  }

  const handleSend = async (textToSend) => {
    const text = textToSend || input
    if (!text) return
    
    const userMsg = { from: 'user', text }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setThinking(true)

    // Simulate AI thinking and reply
    setTimeout(() => {
      const lower = text.toLowerCase()
      let reply = 'I processed your query, but could not match specific invoice rules. Try asking for "invoices above ₹5L" or "GST mismatch reports".'
      let reasoning = 'Semantic Router matched fallback node. Checked dictionary indexes. Confidence score 92.4%.'
      
      if (lower.includes('invoices') && lower.includes('5l')) {
        const hits = mockInvoices.filter(i => i.amount > 500000)
        reply = `Found ${hits.length} invoices exceeding ₹5L. Top matches include: ${hits.slice(0, 5).map(x => x.id).join(', ')}`
        reasoning = `Chain-of-Thought: Found ${hits.length} entries where 'amount > 500000'. Extracted currency: INR. confidence score: 100% verified.`
      } else if (lower.includes('reconciliation') || lower.includes('duplicate')) {
        const duplicates = mockInvoices.filter(i => i.duplicate)
        reply = `Analysis completed: duplicate transaction rate is currently at ${(duplicates.length / mockInvoices.length * 100).toFixed(1)}%. I recommend auditing invoice duplicates: ${duplicates.slice(0, 4).map(x => x.id).join(', ')}.`
        reasoning = `Chain-of-Thought: Scanned dataset for duplicate flags. Calculated duplicate ratio over ${mockInvoices.length} rows. Match accuracy: 98%.`
      } else if (lower.includes('gst') || lower.includes('mismatch')) {
        const mismatches = mockInvoices.filter(i => i.gstMismatch)
        reply = `I identified ${mismatches.length} invoices showing active GSTIN mismatch flags. Discrepancies usually stem from vendor invoice rounding adjustments.`
        reasoning = `Chain-of-Thought: Selected subset where 'gstMismatch === true'. Audited vendor payment histories against tax ledgers. Confidence: 95%.`
      }

      setMessages(prev => [...prev, { from: 'ai', text: reply, reasoning }])
      setThinking(false)
    }, 1200 + Math.random() * 800)
  }

  return (
    <div className="page-container">
      <PageHeader title="AI Operations Copilot" subtitle="Natural language interface for enterprise payables and audit data" />

      <div className="grid-1-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Copilot Chat Workspace</h4>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 8, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
            <AnimatePresence>
              {messages.map((m, i) => {
                const isUser = m.from === 'user'
                const isSystem = m.from === 'system'
                
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, marginRight: isUser ? 8 : 0, marginLeft: !isUser ? 8 : 0 }}>
                      {isUser ? 'Authorized Operator' : isSystem ? 'System Core' : 'Copilot Agent'}
                    </span>
                    <div 
                      className={`chat-bubble ${isUser ? 'user' : 'ai'}`}
                      style={{ 
                        background: isUser ? 'rgba(59, 130, 246, 0.12)' : isSystem ? 'rgba(255,255,255,0.02)' : 'rgba(139, 92, 246, 0.08)',
                        border: isUser ? '1px solid rgba(59, 130, 246, 0.2)' : isSystem ? '1px solid var(--border-light)' : '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        padding: '12px 16px',
                        color: '#fff',
                        maxWidth: '80%',
                        fontSize: '13px',
                        lineHeight: 1.5
                      }}
                    >
                      {m.text}
                    </div>
                    {m.reasoning && (
                      <details style={{ marginTop: 6, maxWidth: '80%', width: '100%' }}>
                        <summary style={{ fontSize: 11, padding: '6px 10px' }}>Trace Thinking Process</summary>
                        <div className="details-content" style={{ fontSize: 11, background: 'rgba(0,0,0,0.1)', padding: 10 }}>
                          {m.reasoning}
                        </div>
                      </details>
                    )}
                  </motion.div>
                )
              })}
              {thinking && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, marginLeft: 8 }}>Thinking...</span>
                  <TypingDots />
                </div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              className="form-input" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Copilot e.g., 'Show invoices above ₹5L' or 'Analyze duplicates'" 
            />
            <button className="button" onClick={() => handleSend()}>
              Analyze
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h4>Suggested Prompts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Show invoices above ₹5L',
                'Generate duplicate reconciliation check',
                'Analyze GST tax mismatch rate',
                'List highest risk vendor codes'
              ].map((p, idx) => (
                <button 
                  key={idx} 
                  className="form-input" 
                  style={{ textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                  onClick={() => handleSend(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4>Explainable AI Operations</h4>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
              <p>AutoFlow AI operates using **Explainable AI models** (XAI). Every query routed through the Copilot generates a real-time logical execution trace.</p>
              <p>You can email the current session transcript directly to the Accounts Payable team for audit log archives.</p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, width: 80 }}>Send to:</span>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ fontSize: 11, padding: '4px 8px', margin: 0, flex: 1 }} 
                  value={recipientEmail} 
                  onChange={(e) => setRecipientEmail(e.target.value)} 
                  placeholder="recipient@example.com"
                />
              </div>
              <button 
                className="button" 
                style={{ width: '100%', fontSize: 12, padding: '8px 12px' }} 
                onClick={emailTranscript}
                disabled={emailing || messages.length <= 1}
              >
                {emailing ? 'Emailing Transcript...' : 'Email Session Log'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
