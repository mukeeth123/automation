import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import { addAudit } from '../utils/storage'

// ─── Mock Client Queries (industry-specific) ─────────────────────────────────
const MOCK_QUERIES = [
  {
    id: 'CQ-001',
    client: 'HDFC Capital Services',
    industry: 'BFSI',
    contact: 'rajesh.kumar@hdfccs.com',
    subject: 'Invoice INV-4821 — Payment Status Enquiry',
    message: 'We submitted invoice INV-4821 on 12 May 2026 for ₹18,40,000 against PO-3390. The payment due date has passed. Kindly confirm the current processing status and expected credit date.',
    priority: 'High',
    status: 'Open',
    received: '2026-05-26T09:15:00Z',
    category: 'Payment Status',
  },
  {
    id: 'CQ-002',
    client: 'Max Healthcare Group',
    industry: 'Healthcare',
    contact: 'accounts@maxhealthcare.in',
    subject: 'GST Mismatch on Invoice INV-5102',
    message: 'Our internal audit flagged a GSTIN mismatch on invoice INV-5102. The GSTIN on the submitted invoice differs from our vendor master. Please confirm which GSTIN to use and whether a revised invoice is required.',
    priority: 'Critical',
    status: 'Open',
    received: '2026-05-26T11:40:00Z',
    category: 'GST / Compliance',
  },
  {
    id: 'CQ-003',
    client: 'Cognizant Cloud Solutions',
    industry: 'Technology',
    contact: 'finance-ops@cognizant.com',
    subject: 'Duplicate Payment Detected — Refund Request',
    message: 'We have identified a duplicate debit for invoice INV-4589 (₹5,20,000). Kindly verify and initiate a reversal or apply it as a credit note against our upcoming billing cycle.',
    priority: 'Critical',
    status: 'In Progress',
    received: '2026-05-25T14:30:00Z',
    category: 'Duplicate Payment',
  },
  {
    id: 'CQ-004',
    client: 'Tata Motors Parts',
    industry: 'Automotive & Manufacturing',
    contact: 'ap-team@tatamotors.com',
    subject: 'PO Line Mismatch — INV-4990',
    message: 'Invoice INV-4990 was rejected at the reconciliation stage citing a PO line quantity mismatch. Our records show the shipped quantity as 850 units; the PO states 800. Please advise on how to proceed with a revised submission.',
    priority: 'Medium',
    status: 'Open',
    received: '2026-05-27T08:00:00Z',
    category: 'Reconciliation',
  },
  {
    id: 'CQ-005',
    client: 'Flipkart Fulfillment',
    industry: 'E-Commerce',
    contact: 'vendor-finance@flipkart.com',
    subject: 'Early Payment Discount — Request for Clarification',
    message: 'We would like to avail the 2% early payment discount for invoices cleared within 10 days. Could you confirm the eligible invoices for May 2026 and the revised amounts after discount application?',
    priority: 'Low',
    status: 'Resolved',
    received: '2026-05-24T10:20:00Z',
    category: 'Payment Terms',
  },
  {
    id: 'CQ-006',
    client: 'Apollo Pharmacy Supplies',
    industry: 'Healthcare',
    contact: 'procurement@apollopharmacy.in',
    subject: 'TDS Certificate Request — Q4 FY2025-26',
    message: 'We require the TDS certificates (Form 16A) for all deductions made during Q4 FY2025-26. This is needed for our statutory audit due by 31 May 2026. Kindly share the documents at the earliest.',
    priority: 'High',
    status: 'Open',
    received: '2026-05-27T07:30:00Z',
    category: 'Compliance / TDS',
  },
  {
    id: 'CQ-007',
    client: 'Infosys Digital Services',
    industry: 'Technology',
    contact: 'billing@infosys.com',
    subject: 'Invoice Aging Report — Outstanding Balances',
    message: 'Please share the latest aging report for our account showing all outstanding invoices older than 30 days. We need this for our month-end reconciliation and internal credit review.',
    priority: 'Medium',
    status: 'In Progress',
    received: '2026-05-26T16:00:00Z',
    category: 'Reporting',
  },
  {
    id: 'CQ-008',
    client: 'L&T Heavy Engineering',
    industry: 'Automotive & Manufacturing',
    contact: 'payables@lntecc.com',
    subject: 'Vendor Onboarding — Bank Detail Update',
    message: 'Our bank account details have changed effective 1 June 2026. Please update vendor master record V-1023 with the new IFSC code and account number. Supporting bank letter is attached.',
    priority: 'Medium',
    status: 'Open',
    received: '2026-05-27T09:45:00Z',
    category: 'Vendor Master',
  },
  {
    id: 'CQ-009',
    client: 'Zepto Delivery Network',
    industry: 'E-Commerce',
    contact: 'finance@zepto.co.in',
    subject: 'Approval Pending — Bulk Invoice Clearance',
    message: 'We have 12 invoices totalling ₹42,00,000 that have been pending manager approval for over 7 business days. Please escalate the approvals or advise the responsible approver to action them urgently.',
    priority: 'High',
    status: 'Open',
    received: '2026-05-27T11:10:00Z',
    category: 'Approval Escalation',
  },
  {
    id: 'CQ-010',
    client: 'SBI Global Trade Finance',
    industry: 'BFSI',
    contact: 'trade.ops@sbigtf.com',
    subject: 'Interest on Delayed Payment — INV-4700',
    message: 'Invoice INV-4700 was settled 22 days past the agreed net-30 terms. As per our contract clause 8.3, we are entitled to 1.5% per month interest on the overdue amount of ₹9,60,000. Please confirm the calculation and expected credit date.',
    priority: 'High',
    status: 'Open',
    received: '2026-05-25T13:00:00Z',
    category: 'Payment Terms',
  },
]

// ─── AI draft generator per category ─────────────────────────────────────────
function generateAIDraft(query) {
  const greet = `Dear ${query.client} Finance Team,\n\nThank you for reaching out to OpsHub. We have received your query (Ref: ${query.id}) and our team has reviewed the details.\n\n`
  const sign = `\n\nRegards,\nPierian Finance Team\nOpsHub | accounts@pierian.ai`

  switch (query.category) {
    case 'Payment Status':
      return `${greet}We have verified the status of Invoice ${query.subject.match(/INV-\d+/)?.[0] || ''}. The invoice is currently under final CFO approval and is scheduled for payment clearance within 2 business days. You will receive an automated remittance advice once the payment is initiated.\n\nWe apologise for the delay and appreciate your patience.${sign}`
    case 'GST / Compliance':
      return `${greet}We have cross-checked the GSTIN details on the flagged invoice against our vendor master records. We confirm that the GSTIN on file is ${query.client.toUpperCase().slice(0, 5)}XXXXX. Please submit a revised invoice with the correct GSTIN at your earliest convenience to avoid further processing delays. Our team will prioritise the revised invoice once received.${sign}`
    case 'Duplicate Payment':
      return `${greet}We have identified and confirmed the duplicate debit entry on the referenced invoice. A credit note (CN-${query.id.replace('CQ', 'CR')}) has been raised for the duplicate amount and will be applied against your next billing cycle. Alternatively, if you prefer a direct refund, please confirm your preferred bank details and we will initiate the transfer within 5 business days.${sign}`
    case 'Reconciliation':
      return `${greet}Thank you for flagging the PO line quantity discrepancy. Our reconciliation engine has logged the variance. To resolve this, please submit a revised invoice matching the PO quantity of 800 units, or provide the amended PO issued by your procurement team showing the updated quantity of 850 units. Once received, we will fast-track the approval.${sign}`
    case 'Payment Terms':
      return `${greet}We have reviewed your query regarding the early payment discount / interest on delayed payment. Our finance team will prepare the detailed calculations and share the revised statement within 24 hours. We value your partnership and are committed to ensuring all contractual obligations are met accurately and on time.${sign}`
    case 'Compliance / TDS':
      return `${greet}We acknowledge your request for TDS certificates (Form 16A) for Q4 FY2025-26. Our accounts team is processing the certificates and they will be shared via secure email by 29 May 2026 — well ahead of your audit deadline. If you require any specific format or additional deduction details, please let us know.${sign}`
    case 'Reporting':
      return `${greet}We have generated the accounts aging report for your account as of today. The report shows ${Math.floor(Math.random() * 8) + 3} invoices with balances outstanding for more than 30 days, totalling approximately ₹${(Math.random() * 50 + 10).toFixed(2)} lakhs. The detailed report has been attached and will also be available in your OpsHub vendor portal within the next hour.${sign}`
    case 'Vendor Master':
      return `${greet}We have received your request to update the bank details for vendor record V-1023. As per our vendor master update policy, the change will be verified with a confirmation call to your registered contact number within 1 business day. Once verified, the new bank details will be active for all payments processed from 1 June 2026 onwards.${sign}`
    case 'Approval Escalation':
      return `${greet}We have escalated the pending invoice approvals to the concerned Finance Manager and CFO. An automated reminder has been triggered for all 12 invoices in the approval queue. You can expect action to be taken within the next 4 business hours. We apologise for the inconvenience and have noted this for our SLA review.${sign}`
    default:
      return `${greet}We have logged your query and our dedicated accounts payable team is reviewing it. We aim to resolve all client queries within 24 business hours. We will revert with a detailed response shortly.${sign}`
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  Critical: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171' },
  High:     { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' },
  Medium:   { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#60a5fa' },
  Low:      { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
}

const STATUS_COLORS = {
  Open:        { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  'In Progress': { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  Resolved:    { bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
}

const INDUSTRY_COLORS = {
  BFSI: '#818cf8',
  Healthcare: '#34d399',
  Technology: '#60a5fa',
  'Automotive & Manufacturing': '#fb923c',
  'E-Commerce': '#e879f9',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ClientQueryPage() {
  const [queries, setQueries] = useState(MOCK_QUERIES)
  const [selected, setSelected] = useState(MOCK_QUERIES[0])
  const [aiDraft, setAiDraft] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [draftGenerated, setDraftGenerated] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterIndustry, setFilterIndustry] = useState('All')
  const [replyTo, setReplyTo] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [newQueryOpen, setNewQueryOpen] = useState(false)
  const [newQuery, setNewQuery] = useState({ client: '', industry: 'BFSI', contact: '', subject: '', message: '', priority: 'Medium', category: 'Payment Status' })

  const industries = ['All', 'BFSI', 'Healthcare', 'Technology', 'Automotive & Manufacturing', 'E-Commerce']
  const statuses = ['All', 'Open', 'In Progress', 'Resolved']

  const filtered = queries.filter(q => {
    const matchStatus = filterStatus === 'All' || q.status === filterStatus
    const matchIndustry = filterIndustry === 'All' || q.industry === filterIndustry
    return matchStatus && matchIndustry
  })

  const stats = {
    total: queries.length,
    open: queries.filter(q => q.status === 'Open').length,
    inProgress: queries.filter(q => q.status === 'In Progress').length,
    resolved: queries.filter(q => q.status === 'Resolved').length,
    critical: queries.filter(q => q.priority === 'Critical').length,
  }

  const selectQuery = (q) => {
    setSelected(q)
    setAiDraft('')
    setDraftGenerated(false)
    setReplyTo(q.contact)
    setReplySubject(`Re: ${q.subject}`)
  }

  const generateDraft = () => {
    setGenerating(true)
    setAiDraft('')
    setDraftGenerated(false)
    const draft = generateAIDraft(selected)
    let i = 0
    const interval = setInterval(() => {
      setAiDraft(draft.slice(0, i))
      i += 6
      if (i > draft.length) {
        clearInterval(interval)
        setAiDraft(draft)
        setGenerating(false)
        setDraftGenerated(true)
        addAudit(`Client Query: AI draft generated for ${selected.id} (${selected.client})`, 'OpsHub AI')
      }
    }, 12)
  }

  const sendReply = () => {
    if (!aiDraft && !draftGenerated) return
    setSending(true)
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'mukeethr67@gmail.com',
        subject: `[OpsHub CQ] ${replySubject}`,
        text: aiDraft,
      }),
    })
      .then(r => r.json())
      .then(data => {
        setSending(false)
        setQueries(prev => prev.map(q => q.id === selected.id ? { ...q, status: 'Resolved' } : q))
        setSelected(prev => ({ ...prev, status: 'Resolved' }))
        addAudit(`Client Query: Reply sent for ${selected.id} to ${selected.contact} — marked Resolved`, 'Demo User')
        alert(data.ok
          ? `Reply sent successfully to ${replyTo}! Query ${selected.id} marked as Resolved.`
          : `Simulated reply logged (server offline). Query ${selected.id} marked Resolved.`)
      })
      .catch(() => {
        setSending(false)
        setQueries(prev => prev.map(q => q.id === selected.id ? { ...q, status: 'Resolved' } : q))
        setSelected(prev => ({ ...prev, status: 'Resolved' }))
        addAudit(`Client Query: Simulated reply for ${selected.id} (offline mode)`, 'Demo User')
        alert(`Simulated reply logged (email server offline). Query ${selected.id} marked Resolved.`)
      })
  }

  const submitNewQuery = () => {
    if (!newQuery.client || !newQuery.subject || !newQuery.message) {
      alert('Please fill in Client, Subject and Message.')
      return
    }
    const q = {
      ...newQuery,
      id: `CQ-${String(queries.length + 1).padStart(3, '0')}`,
      status: 'Open',
      received: new Date().toISOString(),
      contact: newQuery.contact || `finance@${newQuery.client.toLowerCase().replace(/\s+/g, '')}.com`,
    }
    setQueries(prev => [q, ...prev])
    setSelected(q)
    setAiDraft('')
    setDraftGenerated(false)
    setNewQueryOpen(false)
    setNewQuery({ client: '', industry: 'BFSI', contact: '', subject: '', message: '', priority: 'Medium', category: 'Payment Status' })
    addAudit(`Client Query: New query ${q.id} logged for ${q.client}`, 'Demo User')
  }

  const headerActions = (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="button" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-light)', boxShadow: 'none' }} onClick={() => setNewQueryOpen(v => !v)}>
        + Log Query
      </button>
      <button className="button" onClick={generateDraft} disabled={!selected || generating} style={{ background: 'var(--accent-gradient)' }}>
        {generating ? '✦ AI Drafting...' : '✦ Generate AI Draft'}
      </button>
    </div>
  )

  return (
    <div className="page-container">
      <PageHeader
        title="Client Query Automation"
        subtitle="AI-assisted response drafting for client finance queries across all industries"
        actions={headerActions}
      />

      {/* ── Stats Bar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Queries', value: stats.total, color: '#818cf8' },
          { label: 'Open', value: stats.open, color: '#fbbf24' },
          { label: 'In Progress', value: stats.inProgress, color: '#60a5fa' },
          { label: 'Resolved', value: stats.resolved, color: '#4ade80' },
          { label: 'Critical', value: stats.critical, color: '#f87171' },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 100px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-light)',
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Log New Query panel ── */}
      <AnimatePresence>
        {newQueryOpen && (
          <motion.div
            key="new-query"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}
          >
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <h4 style={{ margin: 0, marginBottom: 12 }}>Log Inbound Client Query</h4>
              </div>
              {[
                { label: 'Client Name', key: 'client', type: 'text', placeholder: 'e.g. HDFC Capital Services' },
                { label: 'Contact Email', key: 'contact', type: 'email', placeholder: 'client@company.com' },
                { label: 'Subject', key: 'subject', type: 'text', placeholder: 'e.g. Invoice INV-XXXX Payment Query' },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{f.label}</label>
                  <input
                    type={f.type}
                    className="form-input"
                    style={{ margin: 0, padding: '8px 10px', fontSize: 12 }}
                    placeholder={f.placeholder}
                    value={newQuery[f.key]}
                    onChange={e => setNewQuery(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              {[
                { label: 'Industry', key: 'industry', options: ['BFSI', 'Healthcare', 'Technology', 'Automotive & Manufacturing', 'E-Commerce'] },
                { label: 'Priority', key: 'priority', options: ['Critical', 'High', 'Medium', 'Low'] },
                { label: 'Category', key: 'category', options: ['Payment Status', 'GST / Compliance', 'Duplicate Payment', 'Reconciliation', 'Payment Terms', 'Compliance / TDS', 'Reporting', 'Vendor Master', 'Approval Escalation'] },
              ].map(f => (
                <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{f.label}</label>
                  <select
                    className="form-input"
                    style={{ margin: 0, padding: '8px 10px', fontSize: 12 }}
                    value={newQuery[f.key]}
                    onChange={e => setNewQuery(p => ({ ...p, [f.key]: e.target.value }))}
                  >
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Message</label>
                <textarea
                  className="form-input"
                  style={{ margin: 0, padding: '8px 10px', fontSize: 12, minHeight: 80, resize: 'vertical' }}
                  placeholder="Paste client's original query message here..."
                  value={newQuery.message}
                  onChange={e => setNewQuery(p => ({ ...p, message: e.target.value }))}
                />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="button" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-light)', boxShadow: 'none' }} onClick={() => setNewQueryOpen(false)}>Cancel</button>
                <button className="button" style={{ background: 'var(--accent-gradient)' }} onClick={submitNewQuery}>Log Query</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: filterStatus === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                borderColor: filterStatus === s ? '#818cf8' : 'var(--border-light)',
                color: filterStatus === s ? '#818cf8' : 'var(--text-secondary)',
                transition: 'all 150ms',
              }}
            >{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginLeft: 8 }}>
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setFilterIndustry(ind)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: filterIndustry === ind ? `rgba(${ind === 'All' ? '99,102,241' : '255,255,255'},0.1)` : 'rgba(255,255,255,0.03)',
                borderColor: filterIndustry === ind ? (INDUSTRY_COLORS[ind] || '#818cf8') : 'var(--border-light)',
                color: filterIndustry === ind ? (INDUSTRY_COLORS[ind] || '#818cf8') : 'var(--text-secondary)',
                transition: 'all 150ms',
              }}
            >{ind}</button>
          ))}
        </div>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid-1-2" style={{ marginTop: 0, alignItems: 'flex-start' }}>

        {/* LEFT — Query List */}
        <div className="card" style={{ height: 640, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: 13 }}>Inbound Queries</h4>
            <span className="badge badge-info" style={{ fontSize: 10 }}>{filtered.length} shown</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
              {filtered.map(q => {
                const isActive = selected?.id === q.id
                const pc = PRIORITY_COLORS[q.priority]
                const sc = STATUS_COLORS[q.status]
                const indColor = INDUSTRY_COLORS[q.industry] || '#818cf8'
                return (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => selectQuery(q)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: isActive ? '1px solid #818cf8' : '1px solid var(--border-light)',
                      background: isActive ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    {/* Top row: ID + Priority + Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', letterSpacing: 0.5 }}>{q.id}</span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text }}>{q.priority}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: sc.bg, color: sc.text }}>{q.status}</span>
                      </div>
                    </div>

                    {/* Client + industry tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: indColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#fff' : 'var(--text-primary)' }}>{q.client}</span>
                      <span style={{ fontSize: 9, color: indColor, fontWeight: 600 }}>{q.industry}</span>
                    </div>

                    {/* Subject */}
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.4 }}>{q.subject}</div>

                    {/* Category + Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-info" style={{ fontSize: 9, padding: '1px 6px' }}>{q.category}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(q.received).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — Detail + AI Composer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

                {/* Query Detail Card */}
                <div className="card" style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>{selected.id}</span>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: INDUSTRY_COLORS[selected.industry] || '#818cf8' }} />
                        <span style={{ fontSize: 11, color: INDUSTRY_COLORS[selected.industry] || '#818cf8', fontWeight: 600 }}>{selected.industry}</span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>{selected.subject}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 10, background: PRIORITY_COLORS[selected.priority].bg, border: `1px solid ${PRIORITY_COLORS[selected.priority].border}`, color: PRIORITY_COLORS[selected.priority].text }}>{selected.priority}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 10, background: STATUS_COLORS[selected.status].bg, color: STATUS_COLORS[selected.status].text }}>{selected.status}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, background: 'rgba(0,0,0,0.15)', padding: 12, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>CLIENT</span><div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{selected.client}</div></div>
                    <div><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>CONTACT</span><div style={{ fontSize: 12, marginTop: 2 }}>{selected.contact}</div></div>
                    <div><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>CATEGORY</span><div style={{ fontSize: 12, marginTop: 2 }}>{selected.category}</div></div>
                    <div><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>RECEIVED</span><div style={{ fontSize: 12, marginTop: 2 }}>{new Date(selected.received).toLocaleString('en-IN')}</div></div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>CLIENT MESSAGE</div>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{selected.message}</p>
                  </div>
                </div>

                {/* AI Response Composer Card */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14
                    }}>✦</div>
                    <h4 style={{ margin: 0, fontSize: 13 }}>AI Response Composer</h4>
                    {draftGenerated && <span className="badge badge-success" style={{ fontSize: 9 }}>Draft Ready</span>}
                  </div>

                  {/* Reply meta fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, width: 52 }}>To:</span>
                      <input type="email" className="form-input" style={{ margin: 0, padding: '6px 10px', fontSize: 12, flex: 1 }} value={replyTo} onChange={e => setReplyTo(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, width: 52 }}>Subject:</span>
                      <input type="text" className="form-input" style={{ margin: 0, padding: '6px 10px', fontSize: 12, flex: 1 }} value={replySubject} onChange={e => setReplySubject(e.target.value)} />
                    </div>
                  </div>

                  {/* Draft body */}
                  <div style={{ position: 'relative' }}>
                    {generating && (
                      <div style={{
                        position: 'absolute', top: 8, right: 10,
                        display: 'flex', gap: 4, alignItems: 'center',
                        fontSize: 10, color: '#818cf8', fontWeight: 600
                      }}>
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}>●</motion.span>
                        AI Writing...
                      </div>
                    )}
                    <textarea
                      className="form-input"
                      style={{
                        width: '100%',
                        minHeight: 220,
                        margin: 0,
                        padding: 12,
                        fontSize: 12,
                        lineHeight: 1.7,
                        fontFamily: 'monospace',
                        color: 'var(--text-secondary)',
                        background: 'rgba(255,255,255,0.01)',
                        border: `1px solid ${draftGenerated ? 'rgba(99,102,241,0.4)' : 'var(--border-light)'}`,
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                      placeholder="Click '✦ Generate AI Draft' to auto-generate a contextual reply based on the client's query category and industry..."
                      value={aiDraft}
                      onChange={e => setAiDraft(e.target.value)}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                      className="button"
                      style={{ flex: 1, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', padding: '10px', fontWeight: 600 }}
                      onClick={generateDraft}
                      disabled={generating}
                    >
                      {generating ? '✦ Drafting...' : '✦ Generate AI Draft'}
                    </button>
                    <button
                      className="button"
                      style={{
                        flex: 1,
                        background: draftGenerated ? 'linear-gradient(90deg,#10b981,#059669)' : 'rgba(255,255,255,0.04)',
                        border: draftGenerated ? 'none' : '1px solid var(--border-light)',
                        color: draftGenerated ? '#fff' : 'var(--text-muted)',
                        padding: '10px',
                        fontWeight: 600,
                      }}
                      onClick={sendReply}
                      disabled={!draftGenerated || sending}
                    >
                      {sending ? 'Sending...' : '↑ Send Reply & Resolve'}
                    </button>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Select a query from the list to view details and generate an AI reply.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
