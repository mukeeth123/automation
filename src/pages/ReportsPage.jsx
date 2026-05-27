import React, { useState } from 'react'
import jsPDF from 'jspdf'
import { utils, write } from 'xlsx'
import { saveAs } from 'file-saver'
import { mockInvoices } from '../mock/data'
import PageHeader from '../components/PageHeader'
import { addAudit } from '../utils/storage'

export default function ReportsPage() {
  const [generating, setGenerating] = useState(null)

  const generatePDF = () => {
    setGenerating('pdf')
    setTimeout(() => {
      const doc = new jsPDF()
      
      // 1. Header Banner
      doc.setFillColor(15, 23, 42) // Deep space slate
      doc.rect(0, 0, 210, 38, 'F')
      
      // Logo & Brand Name
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(255, 255, 255)
      doc.text('AutoFlow AI', 15, 18)
      
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(148, 163, 184)
      doc.text('Enterprise Payables & Ledger Reconciliation Suite', 15, 28)
      
      // Right-aligned header details
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)
      doc.text('COMPLIANCE RUN', 195, 15, { align: 'right' })
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      const docId = `AUD-${Math.floor(100000 + Math.random() * 900000)}`
      doc.text(`Doc ID: ${docId}`, 195, 23, { align: 'right' })
      doc.text(`Scope: Finance Manager`, 195, 28, { align: 'right' })
      
      // 2. Document Title Section
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(15, 23, 42)
      doc.text('Executive Reconciliation Report', 15, 52)
      
      // Metadata Details Grid
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Generation Date:  ${new Date().toLocaleString()}`, 15, 60)
      doc.text(`Analysis Scope:   Active Invoices Ingestion Queue`, 15, 66)
      doc.text(`Database Match:   SAP, Oracle, QuickBooks Connection active`, 15, 72)
      
      // Draw a line separator
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.line(15, 78, 195, 78)
      
      // 3. Table Header Row
      doc.setFillColor(248, 250, 252)
      doc.rect(15, 84, 180, 8, 'F')
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(71, 85, 105)
      doc.text('INVOICE ID', 18, 89)
      doc.text('VENDOR ID', 45, 89)
      doc.text('AMOUNT (INR)', 80, 89)
      doc.text('CONFIDENCE', 125, 89)
      doc.text('STATUS', 165, 89)
      
      // Render Invoices Rows
      const reportInvoices = mockInvoices.slice(0, 10)
      let y = 98
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(15, 23, 42)
      
      reportInvoices.forEach(inv => {
        // Draw row borders
        doc.line(15, y + 2, 195, y + 2)
        
        doc.setFont('Helvetica', 'bold')
        doc.text(inv.id, 18, y)
        doc.setFont('Helvetica', 'normal')
        doc.text(inv.vendorId, 45, y)
        doc.text(`INR ${inv.amount.toLocaleString()}`, 80, y)
        doc.text(`${inv.confidence}%`, 125, y)
        
        // Status highlighting
        const isException = inv.status === 'Exception' || inv.gstMismatch || inv.duplicate
        if (isException) {
          doc.setTextColor(239, 68, 68) // Red
          doc.text('EXCEPTION', 165, y)
        } else if (inv.status === 'Pending Approval') {
          doc.setTextColor(245, 158, 11) // Orange
          doc.text('PENDING', 165, y)
        } else {
          doc.setTextColor(16, 185, 129) // Green
          doc.text('PROCESSED', 165, y)
        }
        doc.setTextColor(15, 23, 42) // reset
        y += 10
      })
      
      // 4. Summary Statistics card
      doc.setFillColor(241, 245, 249)
      doc.rect(15, y + 4, 180, 24, 'F')
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(15, 23, 42)
      doc.text('Platform Metrics Summary', 20, y + 10)
      
      doc.setFont('Helvetica', 'normal')
      doc.setTextColor(71, 85, 105)
      doc.text(`Total Records Scanned:  ${mockInvoices.length} invoices`, 20, y + 16)
      doc.text(`Average Processing Confidence: 87.4% accuracy rate`, 20, y + 22)
      
      // 5. Footer Stamp
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text('AutoFlow AI Systems compliance lock code: AF-SHA-256-LEDGER-SECURE-ID-99.', 105, 282, { align: 'center' })
      doc.text('Page 1 of 1', 195, 282, { align: 'right' })
      
      doc.save(`reconciliation-report-${Date.now()}.pdf`)
      addAudit(`Reports engine: Exported high-fidelity reconciliation PDF ${docId}`, 'Demo User')
      setGenerating(null)
    }, 800)
  }

  const generateExcel = () => {
    setGenerating('excel')
    setTimeout(() => {
      const rows = mockInvoices.slice(0, 200).map(i => ({
        'Invoice ID': i.id,
        'Vendor ID': i.vendorId,
        'Amount': i.amount,
        'Currency': i.currency,
        'OCR Confidence': `${i.confidence}%`,
        'Status': i.status,
        'Date String': i.date
      }))
      const ws = utils.json_to_sheet(rows)
      const wb = { Sheets: { 'Audit Ledger': ws }, SheetNames: ['Audit Ledger'] }
      const wbout = write(wb, { bookType: 'xlsx', type: 'array' })
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'invoices_ledger_report.xlsx')
      addAudit('Reports engine: Exported ledger audit spreadsheet', 'Demo User')
      setGenerating(null)
    }, 800)
  }

  return (
    <div className="page-container">
      <PageHeader title="Reporting & Analytics" subtitle="Generate compliance audit ledgers and automated summary files" />

      <div className="grid-3" style={{ marginTop: 8 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📊</div>
          <h4 style={{ margin: 0, paddingBottom: 6 }}>Reconciliation PDF</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, flex: 1, lineHeight: 1.5 }}>
            Complete audit ledger of invoices processed, flagged tax exceptions, duplicate alerts, and manager authorizations.
          </p>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Format: PDF Document (.pdf)</div>
          <button 
            className="button" 
            onClick={generatePDF} 
            disabled={generating !== null}
            style={{ width: '100%', marginTop: 8 }}
          >
            {generating === 'pdf' ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📈</div>
          <h4 style={{ margin: 0, paddingBottom: 6 }}>Ledger Audit Spreadsheet</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, flex: 1, lineHeight: 1.5 }}>
            Granular row-by-row spreadsheet output matching active ERP connection tables. Best for accounting systems ingest.
          </p>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Format: Microsoft Excel (.xlsx)</div>
          <button 
            className="button" 
            onClick={generateExcel} 
            disabled={generating !== null}
            style={{ width: '100%', marginTop: 8 }}
          >
            {generating === 'excel' ? 'Compiling Excel...' : 'Download Excel Ledger'}
          </button>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.85 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🤖</div>
          <h4 style={{ margin: 0, paddingBottom: 6 }}>AI Executive Summaries</h4>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, flex: 1, lineHeight: 1.5 }}>
            Synthesized natural language summary of accounts payable health, SLA performance, and system bottlenecks.
          </p>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Available in AI Copilot Chat workspace</div>
          <button 
            className="button" 
            disabled 
            style={{ 
              width: '100%', 
              marginTop: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-muted)',
              boxShadow: 'none',
              cursor: 'not-allowed'
            }}
          >
            Use AI Copilot
          </button>
        </div>
      </div>
    </div>
  )
}
