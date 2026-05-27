import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageHeader({ title, subtitle, actions }) {
  const { user } = useAuth()
  const { notifications, dismiss } = useNotifications()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const getLevelColor = (level) => {
    switch (level) {
      case 'success': return 'var(--color-success)'
      case 'warning': return 'var(--color-warning)'
      case 'danger': return 'var(--color-danger)'
      default: return 'var(--color-info)'
    }
  }

  return (
    <div className="topbar">
      <div className="header-info">
        <h3>{title}</h3>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>
      <div className="topbar-right">
        {actions && <div className="topbar-actions">{actions}</div>}
        
        {/* Notification Bell Icon */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => setOpen(!open)}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: '50%',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 200ms',
              outline: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
            title="System Alerts"
          >
            <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'var(--color-danger)',
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                borderRadius: '50%',
                width: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-base)',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Window */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: 320,
                  background: 'rgba(12, 18, 38, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg), 0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 9999,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Operations Notifications</span>
                  <span className="badge badge-info" style={{ fontSize: 9 }}>{notifications.length} New</span>
                </div>

                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {notifications.map(n => {
                    const indicatorColor = getLevelColor(n.level)
                    return (
                      <div 
                        key={n.id}
                        style={{ 
                          padding: '12px 16px', 
                          borderBottom: '1px solid var(--border-light)', 
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          background: 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: indicatorColor }} />
                        <div style={{ flex: 1, paddingLeft: 4 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.3 }}>{n.body}</div>
                        </div>
                        <button 
                          onClick={() => dismiss(n.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: 12,
                            padding: '2px 4px',
                            alignSelf: 'flex-start'
                          }}
                          onMouseOver={(e) => e.target.style.color = '#fff'}
                          onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                  {notifications.length === 0 && (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                      No unread alerts in inbox.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User profile Badge */}
        <div className="user-profile-badge">
          <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
