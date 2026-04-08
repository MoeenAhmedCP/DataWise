import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data: alerts, error: alertsError } = await supabase
    .from('alerts')
    .select('*, metric_definitions(id, name, unit, color)')
    .eq('org_id', org_id)
    .order('created_at', { ascending: false })

  if (alertsError) return NextResponse.json({ error: alertsError.message }, { status: 500 })

  const { data: events, error: eventsError } = await supabase
    .from('alert_events')
    .select('*')
    .eq('org_id', org_id)
    .order('triggered_at', { ascending: false })
    .limit(50)

  if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 500 })

  return NextResponse.json({ alerts: alerts ?? [], events: events ?? [] })
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

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      org_id,
      metric_id: body.metric_id,
      name: body.name,
      condition: body.condition,
      threshold: body.threshold,
      threshold_type: body.threshold_type ?? 'percent',
      period_days: body.period_days ?? 7,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ alert: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
