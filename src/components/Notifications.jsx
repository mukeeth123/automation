import React, { useEffect } from 'react'
import { addNotification } from '../utils/storage'
import { NOTIFICATION_DURATION } from '../constants'

export default function Notifications() {
  useEffect(() => {
    // Generate initial sample notifications on load to make the demo active immediately
    const initialAlerts = [
      {
        id: Date.now() - 10000,
        time: new Date(Date.now() - 10000).toISOString(),
        title: 'Duplicate Alert',
        body: 'INV-8988 marked duplicate of existing purchase order',
        level: 'danger'
      },
      {
        id: Date.now() - 5000,
        time: new Date(Date.now() - 5000).toISOString(),
        title: 'Tax Exception Flagged',
        body: 'GSTIN mismatch detected on INV-3167',
        level: 'warning'
      }
    ]
    initialAlerts.forEach(n => addNotification(n))

    const id = setInterval(() => {
      const t = Math.random()
      // 30% chance to generate a new live notification
      if (t > 0.7) {
        const levels = ['info', 'success', 'warning', 'danger']
        const lvl = levels[Math.floor(Math.random() * levels.length)]
        
        let title = 'New approval request'
        let body = `INV-${Math.floor(1000 + Math.random() * 8999)} requires manager authorization`
        
        if (lvl === 'success') {
          title = 'Ledger Match Complete'
          body = `INV-${Math.floor(1000 + Math.random() * 8999)} successfully matched with SAP`
        } else if (lvl === 'warning') {
          title = 'Tax Exception Flagged'
          body = `GSTIN mismatch detected on INV-${Math.floor(1000 + Math.random() * 8999)}`
        } else if (lvl === 'danger') {
          title = 'Duplicate Alert'
          body = `INV-${Math.floor(1000 + Math.random() * 8999)} marked duplicate of existing PO`
        }

        const n = {
          id: Date.now(),
          time: new Date().toISOString(),
          title,
          body,
          level: lvl,
        }
        
        addNotification(n)
      }
    }, NOTIFICATION_DURATION)
    return () => clearInterval(id)
  }, [])

  return null // Runs silently in the background, writing to shared localStorage
}