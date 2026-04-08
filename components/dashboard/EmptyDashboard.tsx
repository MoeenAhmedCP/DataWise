import Link from 'next/link'
import { BarChart3, Plus } from 'lucide-react'

export default function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-[#27272a] rounded-2xl flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-[#71717a]" />
      </div>
      <h2 className="text-lg font-semibold text-[#fafafa] mb-2">No metrics yet</h2>
      <p className="text-sm text-[#71717a] max-w-sm mb-6">
        Upload a CSV file or manually add your first metric to get started with your analytics dashboard.
      </p>
      <Link
        href="/data"
        className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add your first metric
      </Link>
    </div>
  )
}
