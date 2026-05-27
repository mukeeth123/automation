import { STORAGE_KEYS } from '../constants'

// Audit management
export function addAudit(action, user = 'System') {
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]')
  logs.unshift({ time: new Date().toISOString(), action, user })
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs))
}

export function getAudits() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]')
}

export function clearAudits() {
  localStorage.removeItem(STORAGE_KEYS.AUDIT)
}

// Notifications management
export function addNotification(notification) {
  const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
  items.unshift(notification)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items.slice(0, 50)))
  window.dispatchEvent(new CustomEvent('autoflow_notifications_updated'))
}

export function getNotifications() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
}

export function dismissNotification(id) {
  const items = getNotifications()
  const next = items.filter(i => i.id !== id)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('autoflow_notifications_updated'))
}

// Session management
export function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
}

export function getSession() {
  const s = localStorage.getItem(STORAGE_KEYS.SESSION)
  return s ? JSON.parse(s) : null
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION)
}

// Email Server settings
export function saveEmailServerSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.EMAIL_SERVER, JSON.stringify(settings))
}

export function getEmailServerSettings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMAIL_SERVER) || '{}')
}
