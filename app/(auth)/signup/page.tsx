'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateSlug } from '@/lib/utils'
// org creation uses /api/org (service role) to bypass RLS bootstrapping
import { BarChart3, Mail, Lock, Building2, AlertCircle, CheckCircle } from 'lucide-react'

type Step = 'account' | 'organization'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('account')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setStep('organization')
      setLoading(false)
    }
  }

  async function handleOrgStep(e: React.FormEvent) {
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

    router.push('/dashboard')
    router.refresh()
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step === 'account' ? 'text-[#6366f1]' : 'text-[#22c55e]'}`}>
            {step === 'organization' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-[10px]">1</span>
            )}
            Account
          </div>
          <div className="flex-1 h-px bg-[#3f3f46]" />
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step === 'organization' ? 'text-[#6366f1]' : 'text-[#71717a]'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'organization' ? 'bg-[#6366f1] text-white' : 'bg-[#3f3f46] text-[#71717a]'}`}>2</span>
            Organization
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-8">
          {step === 'account' ? (
            <>
              <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Create your account</h1>
              <p className="text-sm text-[#71717a] mb-6">Get started with DataWise</p>

              <form onSubmit={handleAccountStep} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Email</label>
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
                  <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
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

                <button type="submit" disabled={loading} className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                  {loading ? 'Creating account...' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-[#fafafa] mb-1">Set up your workspace</h1>
              <p className="text-sm text-[#71717a] mb-6">Create your organization in DataWise</p>

              <form onSubmit={handleOrgStep} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#71717a] uppercase tracking-wide mb-1.5">Company name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value)
                        setOrgSlug(generateSlug(e.target.value))
                      }}
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
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#71717a] mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[#6366f1] hover:text-[#4f46e5]">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
