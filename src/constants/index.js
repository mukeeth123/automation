// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  INVOICES: '/invoices',
  RECONCILIATION: '/reconciliation',
  APPROVALS: '/approvals',
  EXCEPTIONS: '/exceptions',
  EMAIL: '/email',
  CLASSIFICATION: '/classification',
  COPILOT: '/copilot',
  REPORTS: '/reports',
  AUDIT: '/audit',
  ADMIN: '/admin',
}

// Roles
export const ROLES = {
  CFO: 'CFO',
  FINANCE_MANAGER: 'Finance Manager',
  ANALYST: 'Analyst',
  VENDOR_MANAGER: 'Vendor Manager',
  AUDITOR: 'Auditor',
  ADMIN: 'Admin',
}

// Demo credentials
export const DEMO_CREDENTIALS = [
  { name: 'CFO User', role: ROLES.CFO, email: 'cfo@opshub.ai', password: 'Demo@123' },
  { name: 'Finance Manager', role: ROLES.FINANCE_MANAGER, email: 'finance@opshub.ai', password: 'Demo@123' },
  { name: 'Analyst', role: ROLES.ANALYST, email: 'analyst@opshub.ai', password: 'Demo@123' },
  { name: 'Vendor Manager', role: ROLES.VENDOR_MANAGER, email: 'vendor@opshub.ai', password: 'Demo@123' },
  { name: 'Auditor', role: ROLES.AUDITOR, email: 'auditor@opshub.ai', password: 'Demo@123' },
  { name: 'Admin', role: ROLES.ADMIN, email: 'admin@opshub.ai', password: 'Demo@123' },
]

// Invoice statuses
export const INVOICE_STATUS = {
  PENDING_APPROVAL: 'Pending Approval',
  PROCESSED: 'Processed',
  EXCEPTION: 'Exception',
}

// ERP Systems
export const ERP_SYSTEMS = [
  { name: 'SAP', connected: true, lastSync: '2026-05-25T12:34:00Z' },
  { name: 'Oracle', connected: false, lastSync: null },
  { name: 'Salesforce', connected: true, lastSync: '2026-05-26T08:10:00Z' },
  { name: 'QuickBooks', connected: true, lastSync: '2026-05-24T18:20:00Z' },
]

// Document categories
export const DOC_CATEGORIES = ['Contracts', 'Legal', 'Receipts', 'HR Documents', 'Invoices']

// Email categories
export const EMAIL_CATEGORIES = ['Approval Request', 'Reminder', 'Escalation', 'Vendor Follow-up']

// Sidebar navigation
export const SIDEBAR_NAV = [
  { label: 'Dashboard', route: ROUTES.DASHBOARD },
  { label: 'Invoice Processing', route: ROUTES.INVOICES },
  { label: 'Reconciliation', route: ROUTES.RECONCILIATION },
  { label: 'Approvals', route: ROUTES.APPROVALS },
  { label: 'Exceptions', route: ROUTES.EXCEPTIONS },
  { label: 'Email Automation', route: ROUTES.EMAIL },
  { label: 'Doc Classification', route: ROUTES.CLASSIFICATION },
  { label: 'AI Copilot', route: ROUTES.COPILOT },
  { label: 'Reports', route: ROUTES.REPORTS },
  { label: 'Audit', route: ROUTES.AUDIT },
]

// Admin-only sidebar items
export const ADMIN_NAV = [{ label: 'Admin', route: ROUTES.ADMIN }]

// Colors and theme
export const THEME = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#86efac',
  warning: '#facc15',
  danger: '#ffb4b4',
  bg: '#0f1724',
  card: 'rgba(255,255,255,0.06)',
  glass: 'rgba(255,255,255,0.04)',
  muted: '#9aa6b2',
}

// Storage keys
export const STORAGE_KEYS = {
  SESSION: 'opshub_session',
  AUDIT: 'opshub_audit',
  NOTIFICATIONS: 'opshub_notifications',
  EMAIL_SERVER: 'opshub_email_server',
}

// Notifications config
export const NOTIFICATION_DURATION = 4500

// Pagination
export const PAGE_SIZE = 80
