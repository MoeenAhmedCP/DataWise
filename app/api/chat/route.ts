import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatWithClaude } from '@/lib/claude'
import { formatNumber } from '@/lib/utils'
import type { MetricDataPoint } from '@/lib/types'

function buildMetricsContext(metrics: Array<{
  id: string
  name: string
  unit?: string
  data: MetricDataPoint[]
}>, today: string): string {
  if (metrics.length === 0) return 'No metrics data available yet.'

  let context = `Organization metrics summary (as of ${today}):\n\n`

  for (const metric of metrics) {
    const sorted = [...metric.data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    if (sorted.length === 0) continue

    const latest = sorted[0]
    const sevenDaysAgo = sorted.find((d) => {
      const diff = (new Date(latest.date).getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24)
      return diff >= 6
    })
    const thirtyDaysAgo = sorted.find((d) => {
      const diff = (new Date(latest.date).getTime() - new Date(d.date).getTime()) / (1000 * 60 * 60 * 24)
      return diff >= 28
    })

    context += `Metric: ${metric.name} (unit: ${metric.unit ?? 'none'})\n`
    context += `- Latest value (${latest.date}): ${formatNumber(latest.value, metric.unit)}\n`
    if (sevenDaysAgo) context += `- 7 days ago (${sevenDaysAgo.date}): ${formatNumber(sevenDaysAgo.value, metric.unit)}\n`
    if (thirtyDaysAgo) context += `- 30 days ago (${thirtyDaysAgo.date}): ${formatNumber(thirtyDaysAgo.value, metric.unit)}\n`

    const recentPoints = sorted.slice(0, 30).reverse()
    const dataStr = recentPoints
      .map((d) => `${d.date}: ${d.value}`)
      .join(', ')
    context += `- Last 90 days data: [${dataStr}]\n\n`
  }

  return context
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'No organization' }, { status: 403 })

  const org_id = membership.org_id
  const body = await request.json()
  const { messages } = body

  // Fetch metrics and 90 days of data
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoff = ninetyDaysAgo.toISOString().split('T')[0]

  const { data: metrics } = await supabase
    .from('metric_definitions')
    .select('id, name, unit')
    .eq('org_id', org_id)

  const metricIds = (metrics ?? []).map((m) => m.id)
  let allData: MetricDataPoint[] = []

  if (metricIds.length > 0) {
    const { data } = await supabase
      .from('metric_data')
      .select('*')
      .in('metric_id', metricIds)
      .gte('date', cutoff)
      .order('date', { ascending: true })

    allData = data ?? []
  }

  const metricsWithData = (metrics ?? []).map((m) => ({
    ...m,
    data: allData.filter((d) => d.metric_id === m.id),
  }))

  const today = new Date().toISOString().split('T')[0]
  const metricsContext = buildMetricsContext(metricsWithData, today)

  const systemPrompt = `You are DataWise AI, an analytics assistant for a SaaS analytics platform.
You help business teams understand their metrics data and make decisions.

You have access to the following metrics data for this organization:

${metricsContext}

The metrics context above contains: metric names, units, and the last 90 days of values with dates.

Guidelines:
- Answer questions about trends, comparisons, anomalies, and patterns in the data
- When you identify a drop or rise, calculate the exact percentage and reference the specific dates
- Give concrete, actionable insights — not generic advice
- If the user asks about a metric you don't have data for, say so clearly
- Format numbers clearly: use commas for thousands, 2 decimal places for percentages
- When comparing periods, always specify the exact date ranges you're comparing
- Be conversational but precise
- If you spot something interesting in the data the user didn't ask about, mention it briefly`

  const recentMessages = (messages ?? []).slice(-10)

  const stream = await chatWithClaude(recentMessages, systemPrompt)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}
