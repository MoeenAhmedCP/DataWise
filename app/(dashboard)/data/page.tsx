'use client'

import { useState, useEffect } from 'react'
import CSVUploader from '@/components/data/CSVUploader'
import ManualEntry from '@/components/data/ManualEntry'
import type { MetricDefinition } from '@/lib/types'
import { Upload, PenLine } from 'lucide-react'

type Tab = 'csv' | 'manual'

export default function DataPage() {
  const [tab, setTab] = useState<Tab>('csv')
  const [metrics, setMetrics] = useState<MetricDefinition[]>([])
  const [importCount, setImportCount] = useState(0)

  async function fetchMetrics() {
    const res = await fetch('/api/metrics')
    if (res.ok) {
      const { metrics: data } = await res.json()
      setMetrics(data ?? [])
    }
  }

  useEffect(() => { fetchMetrics() }, [])

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Import Data</h1>
        <p className="text-sm text-[#71717a]">Upload a CSV file or manually enter metric values</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#18181b] border border-[#3f3f46] rounded-lg w-fit mb-6">
        <button
          onClick={() => setTab('csv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'csv'
              ? 'bg-[#27272a] text-[#fafafa]'
              : 'text-[#71717a] hover:text-[#fafafa]'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'manual'
              ? 'bg-[#27272a] text-[#fafafa]'
              : 'text-[#71717a] hover:text-[#fafafa]'
          }`}
        >
          <PenLine className="w-4 h-4" />
          Manual Entry
        </button>
      </div>

      {importCount > 0 && (
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-[#22c55e]">
            {importCount} data points imported successfully.{' '}
            <a href="/dashboard" className="underline">View dashboard →</a>
          </p>
        </div>
      )}

      <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-6">
        {tab === 'csv' ? (
          <CSVUploader
            existingMetrics={metrics.map((m) => ({ id: m.id, name: m.name }))}
            onSuccess={(count) => {
              setImportCount((prev) => prev + count)
              fetchMetrics()
            }}
          />
        ) : (
          <ManualEntry
            metrics={metrics}
            onSuccess={fetchMetrics}
          />
        )}
      </div>

      {/* CSV format hint */}
      {tab === 'csv' && (
        <div className="mt-4 bg-[#18181b] border border-[#3f3f46] rounded-xl p-4">
          <p className="text-xs font-medium text-[#71717a] mb-2">Expected CSV format</p>
          <pre className="text-xs font-mono text-[#71717a] overflow-x-auto">
{`date,signups,revenue
2024-01-01,1247,48320
2024-01-02,1189,46100
2024-01-03,1302,51200`}
          </pre>
        </div>
      )}
    </div>
  )
}
