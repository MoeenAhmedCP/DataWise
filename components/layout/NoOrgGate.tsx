'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@/lib/utils'
import { BarChart3, Building2, AlertCircle } from 'lucide-react'

export default function NoOrgGate({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: orgName, slug: orgSlug }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create workspace')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-[#fafafa]">DataWise</span>
        </div>

        <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-8">
          <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Set up your workspace</h1>
          <p className="text-sm text-[#71717a] mb-6">Signed in as <span className="text-[#fafafa]">{userEmail}</span></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Company name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => { setOrgName(e.target.value); setOrgSlug(generateSlug(e.target.value)) }}
                  placeholder="Acme Corp"
                  required
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#71717a] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Workspace URL</label>
              <div className="flex items-center bg-[#27272a] border border-[#3f3f46] rounded-lg overflow-hidden focus-within:border-[#6366f1]">
                <span className="pl-3 pr-1 text-sm text-[#71717a] whitespace-nowrap">datawise.app/</span>
                <input
                  type="text"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  placeholder="acme-corp"
                  required
                  className="flex-1 bg-transparent py-2.5 pr-4 text-sm text-[#fafafa] placeholder:text-[#71717a] focus:outline-none"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                <p className="text-sm text-[#ef4444]">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
              {loading ? 'Creating workspace...' : 'Create workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
