'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { BarChart3, LayoutDashboard, Database, Bell, MessageSquare, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/data', label: 'Data', icon: Database },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
]

type SidebarProps = {
  orgName: string
  userEmail: string
}

export default function Sidebar({ orgName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-[#18181b] border-r border-[#3f3f46] flex flex-col z-10">
      {/* Logo + Org Name */}
      <div className="p-5 border-b border-[#3f3f46]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 bg-[#6366f1] rounded-lg flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#fafafa] text-sm">DataWise</span>
        </div>
        <div className="bg-[#27272a] rounded-lg px-3 py-2">
          <p className="text-xs text-[#71717a]">Workspace</p>
          <p className="text-sm font-medium text-[#fafafa] truncate">{orgName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#6366f1]/10 text-[#6366f1]'
                  : 'text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-[#3f3f46]">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 bg-[#27272a] rounded-full flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-[#fafafa]">
              {userEmail?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <span className="text-xs text-[#71717a] truncate flex-1">{userEmail}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a] transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
