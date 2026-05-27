import { useState, useCallback, useEffect } from 'react'
import { addNotification, dismissNotification, getNotifications } from '../utils/storage'

export function useNotifications() {
  const [notifications, setNotifications] = useState(getNotifications)

  useEffect(() => {
    const refresh = () => setNotifications(getNotifications())
    window.addEventListener('autoflow_notifications_updated', refresh)
    return () => window.removeEventListener('autoflow_notifications_updated', refresh)
  }, [])

  const add = useCallback((title, body, level = 'info') => {
    const n = {
      id: Date.now(),
      time: new Date().toISOString(),
      title,
      body,
      level,
    }
    addNotification(n)
  }, [])

  const dismiss = useCallback(id => {
    dismissNotification(id)
  }, [])

  return { notifications, add, dismiss }
}
