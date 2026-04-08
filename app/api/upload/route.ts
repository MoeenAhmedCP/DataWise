import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ColumnMapping = {
  dateColumn: string
  metrics: Array<{
    column: string
    metric_name: string
    unit?: string
    color?: string
    metric_id?: string
  }>
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
  const { rows, mapping }: { rows: Record<string, string>[]; mapping: ColumnMapping } = body

  if (!rows || !mapping) {
    return NextResponse.json({ error: 'rows and mapping required' }, { status: 400 })
  }

  let totalImported = 0
  let metricsCreated = 0
  const metricIdCache: Record<string, string> = {}

  for (const metricMapping of mapping.metrics) {
    // Find or create the metric definition
    let metric_id = metricMapping.metric_id

    if (!metric_id) {
      const cacheKey = metricMapping.metric_name
      if (metricIdCache[cacheKey]) {
        metric_id = metricIdCache[cacheKey]
      } else {
        const { data: existing } = await supabase
          .from('metric_definitions')
          .select('id')
          .eq('org_id', org_id)
          .eq('name', metricMapping.metric_name)
          .single()

        if (existing) {
          metric_id = existing.id
        } else {
          const { data: newMetric, error } = await supabase
            .from('metric_definitions')
            .insert({
              org_id,
              name: metricMapping.metric_name,
              unit: metricMapping.unit ?? null,
              color: metricMapping.color ?? '#6366f1',
            })
            .select()
            .single()

          if (error) continue
          metric_id = newMetric.id
          metricsCreated++
        }

        metricIdCache[cacheKey] = metric_id!
      }
    }

    // Build upsert data
    const dataPoints = rows
      .map((row) => {
        const dateVal = row[mapping.dateColumn]
        const valueStr = row[metricMapping.column]
        const value = parseFloat(valueStr?.replace(/[,$%]/g, '') ?? '')

        if (!dateVal || isNaN(value)) return null

        // Try to parse the date
        const parsed = new Date(dateVal)
        if (isNaN(parsed.getTime())) return null

        return {
          org_id,
          metric_id: metric_id!,
          date: parsed.toISOString().split('T')[0],
          value,
        }
      })
      .filter(Boolean) as Array<{ org_id: string; metric_id: string; date: string; value: number }>

    if (dataPoints.length === 0) continue

    const { error } = await supabase
      .from('metric_data')
      .upsert(dataPoints, { onConflict: 'metric_id,date' })

    if (!error) totalImported += dataPoints.length
  }

  return NextResponse.json({
    success: true,
    rows_imported: totalImported,
    metrics_created: metricsCreated,
  })
}
