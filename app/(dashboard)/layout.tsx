import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import NoOrgGate from '@/components/layout/NoOrgGate'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get org membership
  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(name, slug)')
    .eq('user_id', user.id)
    .single()

  // If no org, show inline org creation instead of redirecting (avoids proxy loop)
  if (!membership) {
    return <NoOrgGate userEmail={user.email ?? ''} />
  }

  const orgData = membership.organizations
  const org = Array.isArray(orgData)
    ? (orgData[0] as { name: string; slug: string } | undefined)
    : (orgData as { name: string; slug: string } | null)

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <Sidebar
        orgName={org?.name ?? 'My Organization'}
        userEmail={user.email ?? ''}
      />
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
