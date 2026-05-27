// Mock data generator for OpsHub demo
import { DEMO_CREDENTIALS, ERP_SYSTEMS, EMAIL_CATEGORIES, DOC_CATEGORIES, INVOICE_STATUS } from '../constants'

function rand(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const demoUsers = DEMO_CREDENTIALS

function makeVendors(n = 50) {
  const vendors = []
  
  const industries = [
    {
      name: 'BFSI',
      names: ['HDFC Capital Services', 'ICICI Prudential Insurance', 'SBI Global Trade Finance', 'AXA Assurance Corp', 'Muthoot Financials', 'Capital Trust Ltd']
    },
    {
      name: 'Healthcare',
      names: ['Max Healthcare Group', 'Apollo Pharmacy Supplies', 'Pfizer Diagnostics', 'Medtronic Surgical Solutions', 'Biocon Lab Supplies', 'Fortis Medical Center']
    },
    {
      name: 'Technology',
      names: ['Cognizant Cloud Solutions', 'Infosys Digital Services', 'TCS Global Services', 'Microsoft Cloud Enterprise', 'Wipro Tech Services', 'Tech Mahindra Inc']
    },
    {
      name: 'Automotive & Manufacturing',
      names: ['Tata Motors Parts', 'Maruti Suzuki Logistics', 'Mahindra Industrial Steel', 'Bosch Auto Components', 'L&T Heavy Engineering', 'Reliance Petrochemicals']
    },
    {
      name: 'E-Commerce',
      names: ['Flipkart Fulfillment', 'Amazon Retail Logistics', 'Zepto Delivery Network', 'Meesho Seller Hub', 'JioMart Wholesale', 'Nykaa Cosmetics Supplies']
    }
  ]

  for (let i = 1; i <= n; i++) {
    const indIndex = (i - 1) % industries.length
    const industry = industries[indIndex]
    const nameIndex = Math.floor((i - 1) / industries.length) % industry.names.length
    
    const branchNum = Math.floor((i - 1) / (industries.length * industry.names.length)) + 1
    const finalName = branchNum > 1 ? `${industry.names[nameIndex]} - Div ${branchNum}` : industry.names[nameIndex]

    const score = Math.round(Math.abs(Math.sin(i)) * 100)
    vendors.push({
      id: 'V-' + (1000 + i),
      name: finalName,
      gst: `GSTIN${1000 + i}`,
      risk: score % 100,
      category: industry.name,
      paymentHistory: Array.from({ length: 6 }).map((_, k) => ({
        month: k + 1,
        amount: Math.round(rand(i + k) * 100000),
      })),
    })
  }
  return vendors
}

function makeInvoices(n = 500, vendorsList) {
  const invoices = []
  const vendors = vendorsList || []
  
  const industryDescriptions = {
    'BFSI': [
      'Reinsurance Premium Underwriting fee',
      'Asset Valuation Audit Services',
      'Portfolio Management consultation',
      'Credit risk assessment audit',
      'Payment Gateway Settlement Fees',
      'Security Depository Charges'
    ],
    'Healthcare': [
      'Surgical Equipment Maintenance contract',
      'Bulk Disposable Syringes and Kits',
      'MRI & CT Scanner Annual Service',
      'Diagnostic Reagents & Chemicals supply',
      'Patient Monitoring Software Licenses',
      'Bio-waste Disposal service charge'
    ],
    'Technology': [
      'Enterprise AWS Cloud Infrastructure hosting',
      'Software Engineering sprint resources',
      'Fortinet Enterprise Firewall Subscription',
      'GPT-4 API Model token usage fee',
      'Cybersecurity Penetration Testing audit',
      'Office Productivity Software Licenses'
    ],
    'Automotive & Manufacturing': [
      'Industrial Steel Sheets Grade-A delivery',
      'Auto Assembly component batch delivery',
      'Hydraulic CNC machinery installation',
      'Precision Valves & Gaskets consignment',
      'Plant Equipment Preventive Maintenance',
      'Automotive Glass windshield batch'
    ],
    'E-Commerce': [
      'Warehouse Fulfillment & Sorting service',
      'Last-Mile Delivery logistics contract',
      'Customer Returns processing charges',
      'Payment Checkout API transaction fees',
      'Packaging materials bulk shipment',
      'Promotional SMS gateway campaign'
    ]
  }

  for (let i = 1; i <= n; i++) {
    const vendorIdx = (i - 1) % (vendors.length || 50)
    const vendor = vendors[vendorIdx] || { id: `V-${1001 + vendorIdx}`, name: `Vendor ${vendorIdx + 1}`, category: 'Technology' }
    const industryName = vendor.category
    const descList = industryDescriptions[industryName] || industryDescriptions['Technology']
    const description = descList[(i - 1) % descList.length]

    const amt = Math.round(Math.abs(Math.sin(i * 3.14)) * 1000000) + (i % 7 === 0 ? 500000 : 0)
    const gstMismatch = i % 37 === 0
    const duplicate = i % 101 === 0
    const statusKey = i % 9 === 0 ? INVOICE_STATUS.PENDING_APPROVAL : i % 11 === 0 ? INVOICE_STATUS.EXCEPTION : INVOICE_STATUS.PROCESSED
    invoices.push({
      id: `INV-${1000 + i}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      date: new Date(Date.now() - i * 86400000).toISOString(),
      amount: amt,
      currency: 'INR',
      description,
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
    from: i % 2 === 0 ? 'vendor@partner.com' : 'procure@opshub.ai',
    to: i % 2 === 0 ? 'finance@opshub.ai' : 'vendor@partner.com',
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
