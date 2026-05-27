import React from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Topbar() {
  const { user } = useAuth()
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>Welcome, {user?.name}</div>
        <div style={{ fontSize: 12, color: '#9fb6d0' }}>{user?.role}</div>
      </div>
    </div>
  )
}
