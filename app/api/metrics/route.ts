import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { MetricWithData } from '@/lib/types'

export async function GET() {
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
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: metrics, error: metricsError } = await supabase
    .from('metric_definitions')
    .select('*')
    .eq('org_id', org_id)
    .order('created_at', { ascending: true })

  if (metricsError) return NextResponse.json({ error: metricsError.message }, { status: 500 })
  if (!metrics || metrics.length === 0) return NextResponse.json({ metrics: [] })

  const metricIds = metrics.map((m) => m.id)

  const { data: allData, error: dataError } = await supabase
    .from('metric_data')
    .select('*')
    .in('metric_id', metricIds)
    .gte('date', cutoff)
    .order('date', { ascending: true })

  if (dataError) return NextResponse.json({ error: dataError.message }, { status: 500 })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysCutoff = sevenDaysAgo.toISOString().split('T')[0]

  const metricsWithData: MetricWithData[] = metrics.map((metric) => {
    const data = (allData ?? []).filter((d) => d.metric_id === metric.id)
    const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const latest_value = sorted[0]?.value ?? 0
    const previousEntry = sorted.find((d) => d.date <= sevenDaysCutoff)
    const previous_value = previousEntry?.value ?? latest_value

    const change_percent =
      previous_value !== 0
        ? ((latest_value - previous_value) / previous_value) * 100
        : 0

    const trend =
      change_percent > 0.5 ? 'up' : change_percent < -0.5 ? 'down' : 'neutral'

    return {
      ...metric,
      data,
      latest_value,
      previous_value,
      change_percent,
      trend,
    }
  })

  return NextResponse.json({ metrics: metricsWithData })
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

  const body = await request.json()
  const org_id = membership.org_id

  // Create or find metric definition
  let metric_id = body.metric_id

  if (!metric_id && body.metric_name) {
    const { data: existing } = await supabase
      .from('metric_definitions')
      .select('id')
      .eq('org_id', org_id)
      .eq('name', body.metric_name)
      .single()

    if (existing) {
      metric_id = existing.id
    } else {
      const { data: newMetric, error } = await supabase
        .from('metric_definitions')
        .insert({
          org_id,
          name: body.metric_name,
          unit: body.unit ?? null,
          color: body.color ?? '#6366f1',
          description: body.description ?? null,
        })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      metric_id = newMetric.id
    }
  }

  if (!metric_id) return NextResponse.json({ error: 'metric_id required' }, { status: 400 })

  // Insert data point
  if (body.date && body.value !== undefined) {
    const { error } = await supabase
      .from('metric_data')
      .upsert({
        org_id,
        metric_id,
        date: body.date,
        value: body.value,
        label: body.label ?? null,
      }, { onConflict: 'metric_id,date' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, metric_id })
}
