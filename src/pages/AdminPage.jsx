import React, { useState } from 'react'
import { demoUsers, mockERPSystems } from '../mock/data'
import { addAudit, saveEmailServerSettings, getEmailServerSettings } from '../utils/storage'
import PageHeader from '../components/PageHeader'
import { motion } from 'framer-motion'

export default function AdminPage() {
  const [emailConfig, setEmailConfig] = useState(() => getEmailServerSettings())
  const [users] = useState(() => 
    demoUsers.concat(
      Array.from({ length: 14 }).map((_, i) => ({
        name: 'User ' + (i + 1),
        role: ['Analyst', 'Finance Manager', 'Vendor Manager'][i % 3],
        email: `operator${i + 1}@opshub.ai`,
        password: 'Demo@123'
      }))
    )
  )

  const handleSave = () => {
    saveEmailServerSettings(emailConfig)
    addAudit('Email server settings updated by Admin', 'Admin')
    alert('Email server configurations saved successfully.')
  }

  const sendTest = () => {
    addAudit('Sent compliance test email (simulated)', 'Admin')
    alert('Simulated email server connection: Verification email sent successfully.')
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return 'badge-warning'
      case 'CFO': return 'badge-danger'
      case 'Finance Manager': return 'badge-success'
      default: return 'badge-info'
    }
  }

  return (
    <div className="page-container">
      <PageHeader title="Admin Settings Panel" subtitle="Manage database integrations, email dispatch gateways, and user permissions" />

      <div className="grid-2" style={{ marginTop: 8 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4>Email Dispatch Gateway</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>MAIL SERVER ADDRESS (HOST)</label>
              <input className="form-input" placeholder="e.g. mail.gmail.com" value={emailConfig.host || ''} onChange={e => setEmailConfig(s => ({ ...s, host: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>CONNECTION PORT</label>
                <input className="form-input" placeholder="e.g. 587" value={emailConfig.port || ''} onChange={e => setEmailConfig(s => ({ ...s, port: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>ENCRYPTION PROTOCOL</label>
                <select className="form-input" style={{ appearance: 'none', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}>
                  <option style={{ background: 'var(--bg-surface)' }}>STARTTLS</option>
                  <option style={{ background: 'var(--bg-surface)' }}>SSL/TLS</option>
                  <option style={{ background: 'var(--bg-surface)' }}>None</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>SENDER EMAIL ACCOUNT</label>
              <input className="form-input" placeholder="e.g. ap-alerts@opshub.ai" value={emailConfig.email || ''} onChange={e => setEmailConfig(s => ({ ...s, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 4 }}>EMAIL ACCOUNT PASSWORD</label>
              <input className="form-input" type="password" placeholder="••••••••••••••" value={emailConfig.password || ''} onChange={e => setEmailConfig(s => ({ ...s, password: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="button" onClick={handleSave} style={{ flex: 1 }}>Save Configuration</button>
              <button 
                className="button" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', boxShadow: 'none' }}
                onClick={sendTest}
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4>Integrations & Database Connectors</h4>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mockERPSystems.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'rgba(255, 255, 255, 0.01)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{s.name} Data Engine</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Type: {s.name === 'SAP' || s.name === 'Oracle' ? 'ERP Database' : 'Cloud CRM Ledger'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${s.connected ? 'badge-success' : 'badge-danger'}`}>
                    {s.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        className="card" 
        style={{ marginTop: 24, height: 350, display: 'flex', flexDirection: 'column' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4>Operator Directory & Permissions</h4>
        <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Operator Name</th>
                <th>Enterprise Email</th>
                <th>Security Clearance Role</th>
                <th>Directory Settings</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email}>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <button className="button" style={{ padding: '6px 12px', fontSize: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', boxShadow: 'none' }}>
                      Edit Scope
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
