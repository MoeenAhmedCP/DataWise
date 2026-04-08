'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import type { MetricWithData } from '@/lib/types'
import { formatDate, formatNumber } from '@/lib/utils'

type TrendChartProps = {
  metric: MetricWithData
}

type TooltipProps = {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#71717a] mb-1">{label}</p>
        <p className="text-sm font-mono font-semibold text-[#fafafa]">
          {payload[0]?.value?.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

export default function TrendChart({ metric }: TrendChartProps) {
  const data = metric.data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((d) => ({
      date: formatDate(d.date),
      value: d.value,
    }))

  return (
    <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#fafafa]">{metric.name}</h3>
          {metric.unit && <p className="text-xs text-[#71717a]">{metric.unit}</p>}
        </div>
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: metric.color }}
        />
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metric.color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={50}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={metric.color}
            strokeWidth={2}
            fill={`url(#gradient-${metric.id})`}
            dot={false}
            activeDot={{ r: 4, fill: metric.color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
