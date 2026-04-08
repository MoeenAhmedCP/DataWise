'use client'

import { Trash2, Bell, BellOff } from 'lucide-react'
import type { Alert } from '@/lib/types'
import { formatDateFull } from '@/lib/utils'

type AlertCardProps = {
  alert: Alert
  onDelete: (id: string) => void
}

const conditionLabels: Record<string, string> = {
  drops_by: 'drops by',
  rises_by: 'rises by',
  below: 'goes below',
  above: 'goes above',
}

export default function AlertCard({ alert, onDelete }: AlertCardProps) {
  const metric = alert.metric as { name: string; color?: string } | undefined
  const thresholdDisplay =
    alert.threshold_type === 'percent'
      ? `${alert.threshold}%`
      : alert.threshold.toLocaleString()

  return (
    <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-4 flex items-start gap-4">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          alert.is_active ? 'bg-[#6366f1]/10' : 'bg-[#27272a]'
        }`}
      >
        {alert.is_active ? (
          <Bell className="w-4 h-4 text-[#6366f1]" />
        ) : (
          <BellOff className="w-4 h-4 text-[#71717a]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-[#fafafa]">{alert.name}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            alert.is_active
              ? 'bg-[#22c55e]/10 text-[#22c55e]'
              : 'bg-[#27272a] text-[#71717a]'
          }`}>
            {alert.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <p className="text-xs text-[#71717a]">
          When <span className="text-[#fafafa]">{metric?.name ?? 'metric'}</span>{' '}
          {conditionLabels[alert.condition] ?? alert.condition}{' '}
          <span className="text-[#fafafa] font-mono">{thresholdDisplay}</span>
          {(alert.condition === 'drops_by' || alert.condition === 'rises_by') && (
            <> over <span className="text-[#fafafa]">{alert.period_days} days</span></>
          )}
        </p>

        {alert.last_triggered_at && (
          <p className="text-xs text-[#f59e0b] mt-1">
            Last triggered: {formatDateFull(alert.last_triggered_at)}
          </p>
        )}
      </div>

      <button
        onClick={() => onDelete(alert.id)}
        className="text-[#71717a] hover:text-[#ef4444] transition-colors shrink-0 p-1"
        title="Delete alert"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
