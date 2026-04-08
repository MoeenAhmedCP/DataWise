'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { CHART_COLORS } from '@/lib/utils'

type MetricMapping = {
  column: string
  metric_name: string
  unit: string
  color: string
}

type ColumnMapperProps = {
  columns: string[]
  rows: Record<string, string>[]
  existingMetrics: Array<{ id: string; name: string }>
  onMappingChange: (mapping: {
    dateColumn: string
    metrics: MetricMapping[]
  }) => void
}

export default function ColumnMapper({
  columns,
  rows,
  existingMetrics,
  onMappingChange,
}: ColumnMapperProps) {
  const [dateColumn, setDateColumn] = useState(columns[0] ?? '')
  const [metricMappings, setMetricMappings] = useState<MetricMapping[]>([
    {
      column: columns[1] ?? '',
      metric_name: columns[1] ?? '',
      unit: '',
      color: CHART_COLORS[0],
    },
  ])

  function update(mappings: MetricMapping[], dc: string) {
    onMappingChange({ dateColumn: dc, metrics: mappings })
  }

  function addMetric() {
    const remaining = columns.filter(
      (c) => c !== dateColumn && !metricMappings.find((m) => m.column === c)
    )
    const next = remaining[0] ?? ''
    const newMappings = [
      ...metricMappings,
      {
        column: next,
        metric_name: next,
        unit: '',
        color: CHART_COLORS[metricMappings.length % CHART_COLORS.length],
      },
    ]
    setMetricMappings(newMappings)
    update(newMappings, dateColumn)
  }

  function updateMapping(index: number, field: keyof MetricMapping, value: string) {
    const updated = metricMappings.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    )
    setMetricMappings(updated)
    update(updated, dateColumn)
  }

  function removeMapping(index: number) {
    const updated = metricMappings.filter((_, i) => i !== index)
    setMetricMappings(updated)
    update(updated, dateColumn)
  }

  // Preview first 3 rows
  const previewRows = rows.slice(0, 3)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">
          Date column
        </label>
        <select
          value={dateColumn}
          onChange={(e) => {
            setDateColumn(e.target.value)
            update(metricMappings, e.target.value)
          }}
          className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2.5 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
        >
          {columns.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#71717a] uppercase tracking-wide">
            Metric columns
          </label>
          <button onClick={addMetric} className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#4f46e5] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add metric
          </button>
        </div>

        {metricMappings.map((mapping, i) => (
          <div key={i} className="bg-[#27272a] border border-[#3f3f46] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mapping.color }} />
                <span className="text-xs font-medium text-[#fafafa]">Metric {i + 1}</span>
              </div>
              {metricMappings.length > 1 && (
                <button onClick={() => removeMapping(i)} className="text-[#71717a] hover:text-[#ef4444] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#71717a] mb-1">CSV column</label>
                <select
                  value={mapping.column}
                  onChange={(e) => updateMapping(i, 'column', e.target.value)}
                  className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
                >
                  {columns.filter((c) => c !== dateColumn).map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#71717a] mb-1">Metric name</label>
                <input
                  type="text"
                  value={mapping.metric_name}
                  onChange={(e) => updateMapping(i, 'metric_name', e.target.value)}
                  className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
                  placeholder="e.g. Monthly Signups"
                />
              </div>
              <div>
                <label className="block text-xs text-[#71717a] mb-1">Unit</label>
                <input
                  type="text"
                  value={mapping.unit}
                  onChange={(e) => updateMapping(i, 'unit', e.target.value)}
                  className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:border-[#6366f1] focus:outline-none"
                  placeholder="e.g. users, $, %"
                />
              </div>
              <div>
                <label className="block text-xs text-[#71717a] mb-1">Chart color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={mapping.color}
                    onChange={(e) => updateMapping(i, 'color', e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-[#71717a]">{mapping.color}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {previewRows.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#71717a] uppercase tracking-wide mb-2">Import preview</p>
          <div className="space-y-1">
            {previewRows.map((row, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-mono text-[#71717a] bg-[#27272a] rounded px-3 py-1.5">
                <span className="text-[#fafafa]">{row[dateColumn] ?? '?'}</span>
                {metricMappings.map((m) => (
                  <span key={m.column} style={{ color: m.color }}>
                    {m.metric_name}: {row[m.column] ?? '?'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
