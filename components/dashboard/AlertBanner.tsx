'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { TriggeredAlert } from '@/lib/types'

type AlertBannerProps = {
  triggeredAlerts: TriggeredAlert[]
}

export default function AlertBanner({ triggeredAlerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const visible = triggeredAlerts.filter((t) => !dismissed.has(t.alert.id))

  if (visible.length === 0) return null

  return (
    <div className="space-y-2 mb-6">
      {visible.map((triggered) => (
        <div
          key={triggered.alert.id}
          className="flex items-start gap-3 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-xl px-4 py-3"
        >
          <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#fafafa]">{triggered.alert.name}</p>
            <p className="text-xs text-[#71717a] mt-0.5">{triggered.message}</p>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set([...prev, triggered.alert.id]))}
            className="text-[#71717a] hover:text-[#fafafa] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
