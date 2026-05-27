import React, { useMemo } from 'react'
import { mockInvoices, mockVendors } from '../mock/data'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { motion } from 'framer-motion'
import ActivityFeed from '../components/ActivityFeed'
import PageHeader from '../components/PageHeader'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export default function DashboardPage() {
  const invoices = mockInvoices
  const vendors = mockVendors
  const totalInvoices = invoices.length
  const pending = invoices.filter(i => i.status === 'Pending Approval').length
  const exceptions = invoices.filter(i => i.status === 'Exception' || i.gstMismatch || i.duplicate).length
  const autoApproved = Math.round(totalInvoices * 0.12)

  const trendData = useMemo(() => {
    const labels = Array.from({ length: 12 }).map((_, i) => `M-${i + 1}`)
    return {
      labels,
      datasets: [
        {
          label: 'Approvals',
          data: labels.map((_, i) => Math.round(Math.abs(Math.sin(i)) * 100)),
          backgroundColor: '#3b82f6',
          hoverBackgroundColor: '#8b5cf6',
          borderRadius: 6,
          borderWidth: 0,
        }
      ]
    }
  }, [])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0c1222',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans' }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
        ticks: {
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 10 }
        }
      }
    }
  }

  const kpis = [
    { title: 'Total Invoices', value: totalInvoices, change: '+12% this month', trend: 'success' },
    { title: 'Pending Approvals', value: pending, change: '15 action items', trend: 'warning' },
    { title: 'Auto-Approved', value: autoApproved, change: '84% AI accuracy', trend: 'success' },
    { title: 'Exceptions', value: exceptions, change: '5 requiring attention', trend: 'danger' }
  ]

  const headerActions = (
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="button" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)', boxShadow: 'none', color: 'var(--text-primary)' }}>Export Data</button>
      <button className="button">Refresh Feed</button>
    </div>
  )

  return (
    <div className="page-container">
      <PageHeader title="Executive Dashboard" subtitle="Live · Simulated platform automation statistics" actions={headerActions} />
      
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <motion.div 
            key={i} 
            className="kpi-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div>{k.title}</div>
            <div>{k.value}</div>
            <div style={{ 
              fontSize: '11px', 
              marginTop: '6px', 
              fontWeight: 600,
              color: k.trend === 'success' ? 'var(--color-success)' : k.trend === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)'
            }}>
              {k.change}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid-1-2" style={{ marginTop: 24 }}>
        <motion.div 
          className="card" 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h4>Approval trends</h4>
          <div style={{ flex: 1, minHeight: 320, position: 'relative' }}>
            <Bar data={trendData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, x: 10 }} 
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h4>Live Activity Feed</h4>
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: 320 }}>
            <ActivityFeed />
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="card" 
        style={{ marginTop: 24 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h4>Vendor Risk Snapshot</h4>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
          {vendors.slice(0, 8).map((v, i) => {
            const isHighRisk = v.risk > 70
            const isMedRisk = v.risk >= 40 && v.risk <= 70
            return (
              <div 
                key={v.id} 
                style={{ 
                  minWidth: 180, 
                  background: 'rgba(255, 255, 255, 0.01)', 
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '16px',
                  transition: 'all 200ms'
                }}
                className="vendor-risk-item"
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{v.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Risk score: 
                  <strong style={{ 
                    color: isHighRisk ? 'var(--color-danger)' : isMedRisk ? 'var(--color-warning)' : 'var(--color-success)',
                    marginLeft: 4
                  }}>
                    {v.risk}%
                  </strong>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.category}</div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
