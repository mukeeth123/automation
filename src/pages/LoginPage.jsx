import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { demoUsers } from '../mock/data'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const auth = useAuth()
  const nav = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Simulate minor delay for authentication request
    setTimeout(() => {
      const res = auth.login(email, password)
      setLoading(false)
      if (res.ok) {
        nav('/')
      } else {
        setError(res.message)
      }
    }, 800)
  }

  const quickLogin = (u) => {
    setEmail(u.email)
    setPassword(u.password)
    setLoading(true)
    setTimeout(() => {
      auth.login(u.email, u.password)
      setLoading(false)
      nav('/')
    }, 800)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          width: 900, 
          display: 'grid', 
          gridTemplateColumns: '500px 400px', 
          boxShadow: 'var(--shadow-lg)', 
          borderRadius: '16px', 
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
          background: 'rgba(16, 24, 48, 0.65)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div style={{ padding: 48, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent-gradient)', borderRadius: 8, boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>AutoFlow AI</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enterprise Ingestion Suite</div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 24, margin: '0 0 6px 0', fontWeight: 800 }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Authorize using your enterprise security login credentials.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input 
              className="form-input" 
              placeholder="Username or email address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              disabled={loading}
              required
            />
            <input 
              className="form-input" 
              placeholder="Security password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={loading}
              required
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="button" type="submit" style={{ flex: 1 }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
              <button 
                type="button" 
                className="button" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', boxShadow: 'none' }}
                onClick={() => { setEmail(''); setPassword(''); setError(null) }}
                disabled={loading}
              >
                Clear
              </button>
            </div>
            {error && <div style={{ color: 'var(--color-danger)', fontSize: 12, fontWeight: 600 }}>{error}</div>}
          </form>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 12 }}>
              Quick Operator Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {demoUsers.map(u => (
                <button 
                  key={u.email} 
                  type="button"
                  className="form-input" 
                  onClick={() => quickLogin(u)}
                  disabled={loading}
                  style={{ 
                    cursor: 'pointer', 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    padding: '8px 4px', 
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  {u.role.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
          padding: 48, 
          background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.04) 0%, rgba(139, 92, 246, 0.02) 100%)', 
          borderLeft: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>Security Compliance</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              This environment utilizes simulated Single Sign-On (SSO), Multi-Factor Authentication (MFA), and audit log connectors.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
              <span>SSO Handshake status</span>
              <span>Encrypted</span>
            </div>
            <div className="progress-bar-container" style={{ height: 4 }}>
              <div className="progress-bar-fill" style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Authorized personnel only. Compliance actions are recorded in the audit trail.
          </div>
        </div>
      </motion.div>
    </div>
  )
}
