import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createUserClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Verify the user is authenticated
  const userSupabase = await createUserClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug } = await request.json()
  if (!name || !slug) return NextResponse.json({ error: 'name and slug required' }, { status: 400 })

  // Use service role key to bypass RLS for org bootstrapping
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check slug uniqueness
  const { data: existing } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) return NextResponse.json({ error: 'That workspace URL is already taken' }, { status: 409 })

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name, slug })
    .select()
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 500 })

  const { error: memberError } = await admin
    .from('org_members')
    .insert({ org_id: org.id, user_id: user.id, role: 'owner' })

  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 })

  return NextResponse.json({ org })
}
