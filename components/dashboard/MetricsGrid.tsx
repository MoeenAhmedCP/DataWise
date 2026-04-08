import MetricCard from './MetricCard'
import type { MetricWithData } from '@/lib/types'

type MetricsGridProps = {
  metrics: MetricWithData[]
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
