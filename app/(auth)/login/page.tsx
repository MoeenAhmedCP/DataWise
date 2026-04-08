'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-[#fafafa]">DataWise</span>
        </div>

        <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-8">
          <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Welcome back</h1>
          <p className="text-sm text-[#71717a] mb-6">Sign in to your workspace</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#71717a] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#fafafa] placeholder:text-[#71717a] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                <p className="text-sm text-[#ef4444]">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#71717a] mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#6366f1] hover:text-[#4f46e5]">
            Create workspace
          </Link>
        </p>
      </div>
    </div>
  )
}
