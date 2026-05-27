import { STORAGE_KEYS } from '../constants'

// Audit management
export function addAudit(action, user = 'System') {
  let logs = []
  try {
    logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]')
    if (!Array.isArray(logs)) logs = []
  } catch (e) {
    logs = []
  }
  logs.unshift({ time: new Date().toISOString(), action, user })
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs.slice(0, 100)))
}

export function getAudits() {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || '[]')
    return Array.isArray(logs) ? logs : []
  } catch (e) {
    return []
  }
}

export function clearAudits() {
  localStorage.removeItem(STORAGE_KEYS.AUDIT)
}

// Notifications management
export function addNotification(notification) {
  let items = []
  try {
    items = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
    if (!Array.isArray(items)) items = []
  } catch (e) {
    items = []
  }
  items.unshift(notification)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items.slice(0, 50)))
  window.dispatchEvent(new CustomEvent('opshub_notifications_updated'))
}

export function getNotifications() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]')
    return Array.isArray(items) ? items : []
  } catch (e) {
    return []
  }
}

export function dismissNotification(id) {
  const items = getNotifications()
  const next = items.filter(i => i.id !== id)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('opshub_notifications_updated'))
}

// Session management
export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
  } catch (e) {
    console.error('Error saving session:', e)
  }
}

export function getSession() {
  try {
    const s = localStorage.getItem(STORAGE_KEYS.SESSION)
    return s ? JSON.parse(s) : null
  } catch (e) {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION)
}

// Email Server settings
export function saveEmailServerSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.EMAIL_SERVER, JSON.stringify(settings))
  } catch (e) {
    console.error('Error saving email server settings:', e)
  }
}

export function getEmailServerSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMAIL_SERVER) || '{}')
  } catch (e) {
    return {}
  }
}
