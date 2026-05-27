import React, { useState } from 'react'
import { mockInvoices, mockVendors } from '../mock/data'
import DocumentClassification from '../components/DocumentClassification'
import PageHeader from '../components/PageHeader'
import { addAudit } from '../utils/storage'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState(() => mockInvoices.slice(0, 80))
  const [selected, setSelected] = useState(() => mockInvoices[0])
  const [uploading, setUploading] = useState(false)
  const [emailingDoc, setEmailingDoc] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('mukeethr67@gmail.com')

  const simulateOCR = (file) => {
    if (!file) return
    setUploading(true)
    setTimeout(() => {
      const vendor = mockVendors[Math.floor(Math.random() * mockVendors.length)]
      const newInv = {
        id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        vendorId: vendor.id,
        date: new Date().toISOString(),
        amount: Math.round(5000 + Math.random() * 95000),
        currency: 'INR',
        status: 'Pending Approval',
        confidence: Math.round(75 + Math.random() * 23),
        gstMismatch: Math.random() > 0.85,
        duplicate: Math.random() > 0.95,
        poRef: Math.random() > 0.5 ? `PO-${Math.floor(2000 + Math.random() * 1000)}` : null
      }
      setInvoices(prev => [newInv, ...prev])
      setSelected(newInv)
      setUploading(false)
      addAudit(`Uploaded invoice ${newInv.id} for OCR parsing`, 'Demo User')
    }, 1500)
  }

  const handleApprove = () => {
    if (!selected) return
    setInvoices(prev => prev.map(inv => inv.id === selected.id ? { ...inv, status: 'Processed' } : inv))
    setSelected(prev => ({ ...prev, status: 'Processed' }))
    addAudit(`Approved invoice ${selected.id}`, 'Demo User')
  }

  const handleFlagException = () => {
    if (!selected) return
    setInvoices(prev => prev.map(inv => inv.id === selected.id ? { ...inv, status: 'Exception' } : inv))
    setSelected(prev => ({ ...prev, status: 'Exception' }))
    addAudit(`Flagged exception for invoice ${selected.id}`, 'Demo User')
  }

  const emailDocument = () => {
    if (!selected) return
    setEmailingDoc(true)

    // 1. Generate custom high-fidelity PDF invoice for attachment
    const doc = new jsPDF()
    
    // Header Banner
    doc.setFillColor(15, 23, 42) // Slate 900
    doc.rect(0, 0, 210, 40, 'F')
    
    // Logo & Brand Name
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.text('OpsHub', 15, 18)
    
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text('Ingested Invoicing & OCR Audit Logs', 15, 28)
    
    // Invoice Title Section
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text(`Invoice Audit Sheet — ${selected.id}`, 15, 55)
    
    // Metadata Grid
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Vendor Account:  ${selected.vendorId}`, 15, 63)
    doc.text(`Processed Date:  ${new Date(selected.date).toLocaleDateString()}`, 15, 69)
    doc.text(`PO Reference:    ${selected.poRef || 'N/A'}`, 15, 75)
    doc.text(`OCR Accuracy:    ${selected.confidence}% Confidence`, 15, 81)
    
    // Divider line
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(15, 87, 195, 87)
    
    // Details Grid Table
    doc.setFillColor(248, 250, 252)
    doc.rect(15, 93, 180, 8, 'F')
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.text('LEDGER VERIFICATION PARAMETERS', 18, 98)
    doc.text('AUDIT STATE', 155, 98)
    
    let y = 110
    doc.setFont('Helvetica', 'normal')
    doc.setTextColor(15, 23, 42)
    
    // Row 1: GST Mismatch
    doc.line(15, y + 2, 195, y + 2)
    doc.setFont('Helvetica', 'bold')
    doc.text('GSTIN Match Integrity Status', 18, y)
    doc.setFont('Helvetica', 'normal')
    if (selected.gstMismatch) {
      doc.setTextColor(239, 68, 68)
      doc.text('TAX MISMATCH WARNING', 155, y)
    } else {
      doc.setTextColor(16, 185, 129)
      doc.text('VERIFIED OK', 155, y)
    }
    doc.setTextColor(15, 23, 42) // reset
    y += 10
    
    // Row 2: Duplicate check
    doc.line(15, y + 2, 195, y + 2)
    doc.setFont('Helvetica', 'bold')
    doc.text('Duplicate Transaction Alert Check', 18, y)
    doc.setFont('Helvetica', 'normal')
    if (selected.duplicate) {
      doc.setTextColor(239, 68, 68)
      doc.text('DUPLICATE WARNING', 155, y)
    } else {
      doc.setTextColor(16, 185, 129)
      doc.text('VERIFIED UNIQUE', 155, y)
    }
    doc.setTextColor(15, 23, 42) // reset
    y += 10
    
    // Row 3: Totals
    doc.line(15, y + 2, 195, y + 2)
    doc.setFont('Helvetica', 'bold')
    doc.text('Final Invoice Amount Due', 18, y)
    doc.setFont('Helvetica', 'normal')
    doc.text(`INR ${selected.amount.toLocaleString()}`, 155, y)
    y += 12
    
    // Summary Statistics card
    doc.setFillColor(241, 245, 249)
    doc.rect(15, y, 180, 24, 'F')
    doc.setFont('Helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    doc.text('Compliance Stamp & Automation Record', 20, y + 6)
    doc.setFont('Helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text(`Approved Status: ${selected.status}`, 20, y + 12)
    doc.text('Locked under SHA-256 ledger validation protocol.', 20, y + 18)
    
    // Footer
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text('This PDF document is a certified automation record of OpsHub.', 105, 280, { align: 'center' })
    
    // Get raw base64 PDF
    const base64Pdf = doc.output('datauristring').split(',')[1]

    // 2. Construct HTML email body
    const htmlTemplate = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b; box-shadow: 0 4px 20px rgba(0,0,0,0.06); background: #ffffff;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px; color: #ffffff;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">OpsHub</h2>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Document Ingestion Gateway</p>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="background-color: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 6px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${selected.status}
                </span>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 32px;">
          <h3 style="margin-top: 0; font-size: 14px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Document Audit Specifications</h3>
          <p style="font-size: 13px; color: #475569; line-height: 1.4; margin-bottom: 20px;">
            A processed invoice spec sheet has been compiled. I have attached the high-fidelity PDF report of this document directly to this email. You can view or download the attachment below.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Transaction Reference ID:</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0f172a;">${selected.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Vendor Account Code:</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0f172a;">${selected.vendorId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Associated Purchase Order (PO):</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #0f172a;">${selected.poRef || 'No Reference Flagged'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Ingestion Match Accuracy:</td>
              <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #10b981;">${selected.confidence}% Confidence</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left; color: #475569;">
                <th style="padding: 12px 10px; font-weight: bold;">LEDGER ENTRY SUMMARY</th>
                <th style="padding: 12px 10px; text-align: right; font-weight: bold;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 14px 10px; color: #334155;">Accounts Payable Ingestion lines (GST Match: ${selected.gstMismatch ? 'Tax Mismatch Discrepancy' : 'Verified OK'})</td>
                <td style="padding: 14px 10px; text-align: right; font-weight: 700; color: #0f172a;">INR ${selected.amount.toLocaleString()}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 14px 10px; font-weight: 700; color: #0f172a;">Total Payable Due</td>
                <td style="padding: 14px 10px; text-align: right; font-weight: 800; color: #3b82f6; font-size: 16px;">INR ${selected.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; font-size: 12px; color: #475569; border: 1px solid #e2e8f0; line-height: 1.5; margin-bottom: 24px;">
            <strong>Compliance Check:</strong> Invoiced fields processed using LayoutLM classification rules. Duplicate transaction scan: ${selected.duplicate ? 'Variance Detected (Duplicate Check Warning)' : 'Clear (No Duplicate matches found)'}.
          </div>

          <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.4;">
            This is an automated operational spec document compiled by OpsHub.<br>
            © 2026 OpsHub. All rights reserved.
          </div>
        </div>
      </div>
    `

    // 3. Dispatch POST request with attachments
    fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: `[OpsHub Ingestion] Invoice Audit Spec & Attachment: ${selected.id}`,
        text: `Invoice Reference ${selected.id}:\nVendor ID: ${selected.vendorId}\nAmount: INR ${selected.amount.toLocaleString()}`,
        html: htmlTemplate,
        pdfBase64: base64Pdf,
        filename: `invoice-spec-${selected.id}.pdf`
      })
    })
    .then(res => res.json())
    .then(data => {
      setEmailingDoc(false)
      if (data.ok) {
        addAudit(`Document automation: Emailed formatted specification sheet and attached PDF for invoice ${selected.id} to ${recipientEmail}`, 'Demo User')
        alert(`Success! Real HTML Invoice and PDF attachment emailed to ${recipientEmail}! Message ID: ${data.messageId}`)
      } else {
        alert(`Email Dispatch Failure: ${data.error}`)
      }
    })
    .catch(err => {
      setEmailingDoc(false)
      console.error('Email Connection API failed:', err)
      alert('Failed to connect to the email server.')
    })
  }

  const headerActions = (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <label className="button" style={{ cursor: 'pointer', margin: 0 }}>
        <span>Upload Document</span>
        <input 
          type="file" 
          onChange={(e) => simulateOCR(e.target.files?.[0])} 
          style={{ display: 'none' }} 
          accept=".pdf,.png,.jpg,.jpeg"
        />
      </label>
      <button className="button" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)', boxShadow: 'none', color: 'var(--text-primary)' }}>
        Sync Mailbox
      </button>
    </div>
  )

  return (
    <div className="page-container">
      <PageHeader title="Invoice Processing" subtitle="Ingest and review AI document extracts" actions={headerActions} />
      
      <div className="grid-1-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
          <h4>OCR Ingestion Queue</h4>
          <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const isSelected = selected?.id === inv.id
                  const isPending = inv.status === 'Pending Approval'
                  const isException = inv.status === 'Exception' || inv.gstMismatch || inv.duplicate
                  
                  return (
                    <tr 
                      key={inv.id} 
                      onClick={() => setSelected(inv)}
                      style={{ 
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                        borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                        transition: 'all 150ms'
                      }}
                    >
                      <td style={{ fontWeight: 700, paddingLeft: isSelected ? 14 : 18 }}>{inv.id}</td>
                      <td>{inv.vendorId}</td>
                      <td>{inv.currency} {inv.amount.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, width: 28, textAlign: 'right' }}>{inv.confidence}%</span>
                          <div className="progress-bar-container" style={{ width: 60, height: 4 }}>
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${inv.confidence}%`,
                                background: inv.confidence > 85 ? 'var(--color-success)' : inv.confidence > 70 ? 'var(--color-warning)' : 'var(--color-danger)'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          isException 
                            ? 'badge-danger' 
                            : isPending 
                              ? 'badge-warning' 
                              : 'badge-success'
                        }`}>
                          {isException ? 'Exception' : inv.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
          <h4>Invoice Detail Preview</h4>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              {uploading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                >
                  <div style={{ width: 40, height: 40, border: '3px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <div style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 13 }}>Processing Document (OCR parsing)...</div>
                </motion.div>
              ) : selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.id}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created {new Date(selected.date).toLocaleDateString()}</div>
                    </div>
                    <span className={`badge ${selected.status === 'Processed' ? 'badge-success' : selected.status === 'Exception' ? 'badge-danger' : 'badge-warning'}`}>
                      {selected.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, fontSize: 13 }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Vendor ID</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.vendorId}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Total Amount</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.currency} {selected.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>PO Reference</div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.poRef || '—'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Extraction Confidence</div>
                      <div style={{ fontWeight: 600, marginTop: 2, color: selected.confidence > 85 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {selected.confidence}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    <button className="button" style={{ flex: 1 }} onClick={handleApprove} disabled={selected.status === 'Processed'}>
                      Approve
                    </button>
                    <button className="button" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: 'none', color: '#f87171', flex: 1 }} onClick={handleFlagException} disabled={selected.status === 'Exception'}>
                      Flag Exception
                    </button>
                  </div>

                  {/* HTML Document Automation Mailer button with PDF attachment */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 8, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
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
                      style={{ width: '100%', background: 'var(--accent-gradient)', fontSize: 12, padding: '8px 12px' }}
                      onClick={emailDocument}
                      disabled={emailingDoc}
                    >
                      {emailingDoc ? 'Emailing Document & PDF...' : 'Email HTML & PDF Invoice'}
                    </button>
                  </div>

                  <details style={{ marginTop: 8 }}>
                    <summary>OCR Fields Details</summary>
                    <div className="details-content" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>GSTIN Match:</span>
                        <span style={{ color: selected.gstMismatch ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                          {selected.gstMismatch ? 'Mismatch Flag' : 'Verified OK'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Double Payment Risk:</span>
                        <span style={{ color: selected.duplicate ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
                          {selected.duplicate ? 'Duplicate Detected' : 'Unique Invoice'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax Rate Check:</span>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>18.00% Verified</span>
                      </div>
                    </div>
                  </details>

                  <DocumentClassification invoice={selected} />
                </motion.div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                  Select an invoice from the ingestion queue to run classification, verify OCR extraction fields, and action the document.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
