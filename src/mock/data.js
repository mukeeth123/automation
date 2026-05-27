// Mock data generator for AutoFlow AI demo
import { DEMO_CREDENTIALS, ERP_SYSTEMS, EMAIL_CATEGORIES, DOC_CATEGORIES, INVOICE_STATUS } from '../constants'

function rand(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const demoUsers = DEMO_CREDENTIALS

function makeVendors(n = 50) {
  const vendors = []
  for (let i = 1; i <= n; i++) {
    const score = Math.round(Math.abs(Math.sin(i)) * 100)
    vendors.push({
      id: 'V-' + (1000 + i),
      name: `Vendor ${i}`,
      gst: `GSTIN${1000 + i}`,
      risk: score % 100,
      category: i % 5 === 0 ? 'Consulting' : 'Supplier',
      paymentHistory: Array.from({ length: 6 }).map((_, k) => ({
        month: k + 1,
        amount: Math.round(rand(i + k) * 100000),
      })),
    })
  }
  return vendors
}

function makeInvoices(n = 500) {
  const invoices = []
  for (let i = 1; i <= n; i++) {
    const amt = Math.round(Math.abs(Math.sin(i * 3.14)) * 1000000) + (i % 7 === 0 ? 500000 : 0)
    const gstMismatch = i % 37 === 0
    const duplicate = i % 101 === 0
    const statusKey = i % 9 === 0 ? INVOICE_STATUS.PENDING_APPROVAL : i % 11 === 0 ? INVOICE_STATUS.EXCEPTION : INVOICE_STATUS.PROCESSED
    invoices.push({
      id: `INV-${1000 + i}`,
      vendorId: 'V-' + (1000 + (i % 50) + 1),
      date: new Date(Date.now() - i * 86400000).toISOString(),
      amount: amt,
      currency: 'INR',
      gstMismatch,
      duplicate,
      status: statusKey,
      confidence: Math.round(75 + Math.abs(Math.sin(i)) * 20),
      matchedERP: i % 5 !== 0,
      poRef: i % 3 === 0 ? `PO-${2000 + (i % 30)}` : null,
    })
  }
  return invoices
}

function makeEmails(n = 24) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `EMAIL-${2000 + i}`,
    from: i % 2 === 0 ? 'vendor@partner.com' : 'procure@autoflow.ai',
    to: i % 2 === 0 ? 'finance@autoflow.ai' : 'vendor@partner.com',
    subject: `${EMAIL_CATEGORIES[i % EMAIL_CATEGORIES.length]} for INV-${1010 + i}`,
    status: i % 5 === 0 ? 'Sent' : 'Pending',
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    category: EMAIL_CATEGORIES[i % EMAIL_CATEGORIES.length],
  }))
}

function makeDocs(n = 20) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `DOC-${3000 + i}`,
    title: `${DOC_CATEGORIES[i % DOC_CATEGORIES.length]} ${i + 1}`,
    type: DOC_CATEGORIES[i % DOC_CATEGORIES.length],
    summary: `Simulated ${DOC_CATEGORIES[i % DOC_CATEGORIES.length]} classification summary for document ${i + 1}.`,
    tags:
      DOC_CATEGORIES[i % DOC_CATEGORIES.length] === 'Invoices'
        ? ['finance', 'gst', 'payable']
        : ['review', 'legal', 'compliance'],
  }))
}

export const mockVendors = makeVendors(50)
export const mockInvoices = makeInvoices(500)
export const mockERPSystems = ERP_SYSTEMS
export const mockEmails = makeEmails(24)
export const mockDocuments = makeDocs(20)

export const mockActivity = [
  { id: 1, time: new Date().toISOString(), text: 'Imported 120 invoices from mailbox', level: 'info' },
  { id: 2, time: new Date().toISOString(), text: 'AI auto-approved 8 low-risk invoices', level: 'success' },
  { id: 3, time: new Date().toISOString(), text: 'Escalated INV-1050 to Finance Manager', level: 'warning' },
]

export const mockNotifications = []
