'use client'

import { useState } from 'react'
import { AlertCircle, Plus } from 'lucide-react'
import type { MetricDefinition } from '@/lib/types'

type CreateAlertFormProps = {
  metrics: MetricDefinition[]
  onCreated: () => void
  onCancel: () => void
}

export default function CreateAlertForm({ metrics, onCreated, onCancel }: CreateAlertFormProps) {
  const [name, setName] = useState('')
  const [metricId, setMetricId] = useState(metrics[0]?.id ?? '')
  const [condition, setCondition] = useState<string>('drops_by')
  const [threshold, setThreshold] = useState('')
  const [thresholdType, setThresholdType] = useState<'percent' | 'absolute'>('percent')
  const [periodDays, setPeriodDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAbsoluteOnly = condition === 'below' || condition === 'above'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        metric_id: metricId,
        condition,
        threshold: parseFloat(threshold),
        threshold_type: isAbsoluteOnly ? 'absolute' : thresholdType,
        period_days: periodDays,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to create alert')
    } else {
      onCreated()
    }
  }

  return (
    <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-6">
      <h3 className="text-sm font-semibold text-[#fafafa] mb-4">Create Alert</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Alert name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Signup Drop Alert"
            required
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Metric</label>
          <select
            value={metricId}
            onChange={(e) => setMetricId(e.target.value)}
            required
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
          >
            {metrics.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
            >
              <option value="drops_by">Drops by</option>
              <option value="rises_by">Rises by</option>
              <option value="below">Goes below</option>
              <option value="above">Goes above</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Threshold</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="20"
                required
                step="any"
                className="flex-1 min-w-0 bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] font-mono focus:border-[#6366f1] focus:outline-none"
              />
              {!isAbsoluteOnly && (
                <select
                  value={thresholdType}
                  onChange={(e) => setThresholdType(e.target.value as 'percent' | 'absolute')}
                  className="bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
                >
                  <option value="percent">%</option>
                  <option value="absolute">abs</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {!isAbsoluteOnly && (
          <div>
            <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">
              Compare against
            </label>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
            >
              <option value={7}>7 days ago</option>
              <option value={14}>14 days ago</option>
              <option value={30}>30 days ago</option>
            </select>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
            <p className="text-sm text-[#ef4444]">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || metrics.length === 0}
            className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create alert'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-medium rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
