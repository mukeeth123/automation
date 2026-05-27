import React, { createContext, useContext, useState, useEffect } from 'react'
import { DEMO_CREDENTIALS, STORAGE_KEYS } from '../constants'
import { saveSession, getSession, clearSession } from '../utils/storage'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    if (s) setUser(s)
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const u = DEMO_CREDENTIALS.find(x => x.email === email && x.password === password)
    if (u) {
      const session = { ...u, token: 'mock-token-' + u.role }
      saveSession(session)
      setUser(session)
      return { ok: true }
    }
    return { ok: false, message: 'Invalid demo credentials' }
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  const switchRole = (role) => {
    if (!user) return
    const replaced = { ...user, role }
    saveSession(replaced)
    setUser(replaced)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
