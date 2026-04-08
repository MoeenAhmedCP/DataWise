'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'
import type { MetricWithData } from '@/lib/types'
import { formatNumber } from '@/lib/utils'

type MetricCardProps = {
  metric: MetricWithData
}

export default function MetricCard({ metric }: MetricCardProps) {
  const isUp = metric.trend === 'up'
  const isDown = metric.trend === 'down'

  const sparklineData = metric.data
    .slice(-7)
    .map((d) => ({ value: d.value }))

  return (
    <div
      className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-5 relative overflow-hidden"
      style={{ borderLeft: `3px solid ${metric.color}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#71717a] uppercase tracking-wide truncate">
            {metric.name}
          </p>
          <p className="text-2xl font-mono font-semibold text-[#fafafa] mt-1">
            {formatNumber(metric.latest_value, metric.unit)}
          </p>
        </div>
        <div className="w-20 h-10 shrink-0 ml-3">
          {sparklineData.length > 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={metric.color}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {isUp ? (
          <TrendingUp className="w-3.5 h-3.5 text-[#22c55e]" />
        ) : isDown ? (
          <TrendingDown className="w-3.5 h-3.5 text-[#ef4444]" />
        ) : (
          <Minus className="w-3.5 h-3.5 text-[#71717a]" />
        )}
        <span
          className={`text-xs font-medium ${
            isUp ? 'text-[#22c55e]' : isDown ? 'text-[#ef4444]' : 'text-[#71717a]'
          }`}
        >
          {metric.change_percent > 0 ? '+' : ''}{metric.change_percent.toFixed(1)}%
        </span>
        <span className="text-xs text-[#71717a]">vs 7 days ago</span>
      </div>
    </div>
  )
}
