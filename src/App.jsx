import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ROUTES } from './constants'
import AppLayout from './layout/AppLayout'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CopilotPage from './pages/CopilotPage'
import InvoicesPage from './pages/InvoicesPage'
import ApprovalsPage from './pages/ApprovalsPage'
import AdminPage from './pages/AdminPage'
import ExceptionsPage from './pages/ExceptionsPage'
import AuditPage from './pages/AuditPage'
import ReportsPage from './pages/ReportsPage'
import ReconciliationPage from './pages/ReconciliationPage'
import EmailAutomationPage from './pages/EmailAutomationPage'
import DocumentClassificationPage from './pages/DocumentClassificationPage'
import ClientQueryPage from './pages/ClientQueryPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  if (!user) return <Navigate to={ROUTES.LOGIN} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.COPILOT} element={<CopilotPage />} />
        <Route path={ROUTES.INVOICES} element={<InvoicesPage />} />
        <Route path={ROUTES.APPROVALS} element={<ApprovalsPage />} />
        <Route path={ROUTES.EXCEPTIONS} element={<ExceptionsPage />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        <Route path={ROUTES.AUDIT} element={<AuditPage />} />
        <Route path={ROUTES.RECONCILIATION} element={<ReconciliationPage />} />
        <Route path={ROUTES.EMAIL} element={<EmailAutomationPage />} />
        <Route path={ROUTES.CLASSIFICATION} element={<DocumentClassificationPage />} />
        <Route path={ROUTES.CLIENT_QUERIES} element={<ClientQueryPage />} />
        <Route path={ROUTES.ADMIN} element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} />} />
    </Routes>
  )
}
