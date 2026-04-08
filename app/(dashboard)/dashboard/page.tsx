'use client'

import { useEffect, useState } from 'react'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import TrendChart from '@/components/dashboard/TrendChart'
import AlertBanner from '@/components/dashboard/AlertBanner'
import EmptyDashboard from '@/components/dashboard/EmptyDashboard'
import type { MetricWithData, Alert, TriggeredAlert } from '@/lib/types'
import { evaluateAlerts } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricWithData[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [triggered, setTriggered] = useState<TriggeredAlert[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    const [metricsRes, alertsRes] = await Promise.all([
      fetch('/api/metrics'),
      fetch('/api/alerts'),
    ])

    if (metricsRes.ok) {
      const { metrics: data } = await metricsRes.json()
      setMetrics(data ?? [])

      if (alertsRes.ok) {
        const { alerts: alertData } = await alertsRes.json()
        setAlerts(alertData ?? [])
        setTriggered(evaluateAlerts(alertData ?? [], data ?? []))
      }
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2 text-[#71717a]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (metrics.length === 0) {
    return <EmptyDashboard />
  }

  return (
    <div className="space-y-6">
      <AlertBanner triggeredAlerts={triggered} />

      <div>
        <h2 className="text-xs font-medium text-[#71717a] uppercase tracking-wide mb-3">Key Metrics</h2>
        <MetricsGrid metrics={metrics} />
      </div>

      <div>
        <h2 className="text-xs font-medium text-[#71717a] uppercase tracking-wide mb-3">30-Day Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <TrendChart key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  )
}
