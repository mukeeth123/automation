import { useCallback } from 'react'
import { addAudit, getAudits } from '../utils/storage'

export function useAudit() {
  const logAction = useCallback((action, user = 'System') => {
    addAudit(action, user)
  }, [])

  const getHistory = useCallback(() => {
    return getAudits()
  }, [])

  return { logAction, getHistory }
}
