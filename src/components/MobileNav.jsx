import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROUTES, ROLES } from '../constants'

export default function MobileNav() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="mobile-nav">
      <Link to={ROUTES.DASHBOARD}>Dash</Link>
      <Link to={ROUTES.INVOICES}>Invoices</Link>
      <Link to={ROUTES.APPROVALS}>Approvals</Link>
      <Link to={ROUTES.COPILOT}>Copilot</Link>
      {user.role === ROLES.ADMIN && <Link to={ROUTES.ADMIN}>Admin</Link>}
    </div>
  )
}
