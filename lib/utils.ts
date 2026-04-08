import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Alert, MetricWithData, TriggeredAlert } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, unit?: string): string {
  if (unit === '$') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  if (unit === '%') {
    return `${value.toFixed(2)}%`
  }
  return `${new Intl.NumberFormat('en-US').format(value)}${unit ? ` ${unit}` : ''}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function getDateNDaysAgo(n: number): string {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return date.toISOString().split('T')[0]
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function evaluateAlerts(
  alerts: Alert[],
  metricsWithData: MetricWithData[]
): TriggeredAlert[] {
  const triggered: TriggeredAlert[] = []

  for (const alert of alerts) {
    if (!alert.is_active) continue

    const metric = metricsWithData.find((m) => m.id === alert.metric_id)
    if (!metric || metric.data.length === 0) continue

    // Sort data by date descending
    const sortedData = [...metric.data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const currentValue = sortedData[0]?.value
    if (currentValue === undefined) continue

    // Find the value from N days ago
    const cutoffDate = getDateNDaysAgo(alert.period_days)
    const previousEntry = sortedData.find((d) => d.date <= cutoffDate)
    const previousValue = previousEntry?.value

    if (previousValue === undefined && (alert.condition === 'drops_by' || alert.condition === 'rises_by')) {
      continue
    }

    let shouldTrigger = false
    let changePercent = 0
    let message = ''

    if (alert.condition === 'drops_by' && previousValue !== undefined) {
      changePercent = ((currentValue - previousValue) / previousValue) * 100
      if (alert.threshold_type === 'percent') {
        shouldTrigger = changePercent <= -alert.threshold
      } else {
        shouldTrigger = previousValue - currentValue >= alert.threshold
      }
      if (shouldTrigger) {
        message = `${metric.name} dropped by ${Math.abs(changePercent).toFixed(1)}% over the last ${alert.period_days} days (from ${formatNumber(previousValue, metric.unit)} to ${formatNumber(currentValue, metric.unit)})`
      }
    } else if (alert.condition === 'rises_by' && previousValue !== undefined) {
      changePercent = ((currentValue - previousValue) / previousValue) * 100
      if (alert.threshold_type === 'percent') {
        shouldTrigger = changePercent >= alert.threshold
      } else {
        shouldTrigger = currentValue - previousValue >= alert.threshold
      }
      if (shouldTrigger) {
        message = `${metric.name} rose by ${changePercent.toFixed(1)}% over the last ${alert.period_days} days`
      }
    } else if (alert.condition === 'below') {
      shouldTrigger = currentValue < alert.threshold
      if (shouldTrigger) {
        message = `${metric.name} is below ${formatNumber(alert.threshold, metric.unit)} (current: ${formatNumber(currentValue, metric.unit)})`
      }
    } else if (alert.condition === 'above') {
      shouldTrigger = currentValue > alert.threshold
      if (shouldTrigger) {
        message = `${metric.name} is above ${formatNumber(alert.threshold, metric.unit)} (current: ${formatNumber(currentValue, metric.unit)})`
      }
    }

    if (shouldTrigger) {
      triggered.push({
        alert,
        message,
        current_value: currentValue,
        previous_value: previousValue ?? currentValue,
        change_percent: changePercent,
      })
    }
  }

  return triggered
}

export const CHART_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
]
