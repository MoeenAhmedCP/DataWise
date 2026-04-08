'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Plus } from 'lucide-react'
import { CHART_COLORS } from '@/lib/utils'
import type { MetricDefinition } from '@/lib/types'

type ManualEntryProps = {
  metrics: MetricDefinition[]
  onSuccess: () => void
}

export default function ManualEntry({ metrics, onSuccess }: ManualEntryProps) {
  const [metricId, setMetricId] = useState(metrics[0]?.id ?? 'new')
  const [metricName, setMetricName] = useState('')
  const [unit, setUnit] = useState('')
  const [color, setColor] = useState(CHART_COLORS[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [value, setValue] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const body: Record<string, unknown> = {
      date,
      value: parseFloat(value),
      label: label || undefined,
    }

    if (metricId === 'new') {
      body.metric_name = metricName
      body.unit = unit || undefined
      body.color = color
    } else {
      body.metric_id = metricId
    }

    const res = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to add data point')
    } else {
      setSuccess(true)
      setValue('')
      setLabel('')
      onSuccess()
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">
          Metric
        </label>
        <select
          value={metricId}
          onChange={(e) => setMetricId(e.target.value)}
          className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
        >
          {metrics.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
          <option value="new">+ Create new metric</option>
        </select>
      </div>

      {metricId === 'new' && (
        <div className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-4 space-y-3">
          <p className="text-xs font-medium text-[#fafafa]">New metric details</p>
          <div>
            <label className="block text-xs text-[#71717a] mb-1">Metric name</label>
            <input
              type="text"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="e.g. Monthly Signups"
              required
              className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#71717a] mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="users, $, %"
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#71717a] mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-[#71717a]">{color}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            required
            step="any"
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] font-mono focus:border-[#6366f1] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Label (optional)</label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Q1 peak"
          className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
          <p className="text-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 text-[#22c55e] shrink-0" />
          <p className="text-sm text-[#22c55e]">Data point added successfully</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        {loading ? 'Adding...' : 'Add data point'}
      </button>
    </form>
  )
}
