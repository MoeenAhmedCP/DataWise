'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Plus } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/data': 'Data',
  '/alerts': 'Alerts',
  '/chat': 'AI Chat',
}

type TopbarProps = {
  alertCount?: number
}

export default function Topbar({ alertCount = 0 }: TopbarProps) {
  const pathname = usePathname()
  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] ?? 'DataWise'

  return (
    <header className="h-14 border-b border-[#3f3f46] bg-[#09090b] flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold text-[#fafafa]">{title}</h1>
      <div className="flex items-center gap-3">
        <Link
          href="/data"
          className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Data
        </Link>
        <Link href="/alerts" className="relative p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a] rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full" />
          )}
        </Link>
      </div>
    </header>
  )
}
