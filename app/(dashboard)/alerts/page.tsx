'use client'

import { useState, useEffect } from 'react'
import AlertCard from '@/components/alerts/AlertCard'
import CreateAlertForm from '@/components/alerts/CreateAlertForm'
import type { Alert, AlertEvent, MetricDefinition } from '@/lib/types'
import { Plus, Bell, Clock, RefreshCw } from 'lucide-react'
import { formatDateFull } from '@/lib/utils'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [events, setEvents] = useState<AlertEvent[]>([])
  const [metrics, setMetrics] = useState<MetricDefinition[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    const [alertsRes, metricsRes] = await Promise.all([
      fetch('/api/alerts'),
      fetch('/api/metrics'),
    ])

    if (alertsRes.ok) {
      const { alerts: a, events: e } = await alertsRes.json()
      setAlerts(a ?? [])
      setEvents(e ?? [])
    }

    if (metricsRes.ok) {
      const { metrics: m } = await metricsRes.json()
      setMetrics(m ?? [])
    }

    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleDelete(id: string) {
    await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' })
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2 text-[#71717a]">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading alerts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Alerts</h1>
          <p className="text-sm text-[#71717a]">Get notified when metrics cross your thresholds</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Alert
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <CreateAlertForm
          metrics={metrics}
          onCreated={() => { setShowForm(false); fetchData() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {metrics.length === 0 && (
        <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-xl px-4 py-3">
          <p className="text-sm text-[#f59e0b]">Add some metrics first before creating alerts.</p>
        </div>
      )}

      {/* Active Alerts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-[#71717a]" />
          <h2 className="text-sm font-semibold text-[#fafafa]">Alert Rules</h2>
          <span className="text-xs text-[#71717a] bg-[#27272a] px-2 py-0.5 rounded-full">{alerts.length}</span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-8 text-center">
            <Bell className="w-8 h-8 text-[#71717a] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#fafafa] mb-1">No alerts configured</p>
            <p className="text-xs text-[#71717a]">Create your first alert to get notified about metric changes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Events */}
      {events.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#71717a]" />
            <h2 className="text-sm font-semibold text-[#fafafa]">Recent Events</h2>
          </div>
          <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl overflow-hidden">
            {events.slice(0, 10).map((event, i) => (
              <div
                key={event.id}
                className={`px-4 py-3 flex items-start gap-3 ${
                  i < events.length - 1 ? 'border-b border-[#3f3f46]' : ''
                }`}
              >
                <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#fafafa]">{event.message}</p>
                  <p className="text-xs text-[#71717a] mt-0.5">{formatDateFull(event.triggered_at)}</p>
                </div>
                {event.change_percent !== 0 && (
                  <span className={`text-xs font-mono shrink-0 ${event.change_percent < 0 ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                    {event.change_percent > 0 ? '+' : ''}{event.change_percent.toFixed(1)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
