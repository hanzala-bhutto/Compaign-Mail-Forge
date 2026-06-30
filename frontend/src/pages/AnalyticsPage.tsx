import { useParams, Link } from 'react-router-dom'
import { useAnalytics } from '@/hooks/useAnalytics'

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: analytics, isLoading, error } = useAnalytics(id ?? '')

  if (isLoading) return <p className="text-muted-foreground">Loading analytics...</p>
  if (error) return <p className="text-destructive">Failed to load analytics.</p>

  return (
    <div className="max-w-2xl">
      <Link to={`/campaigns/${id}`} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        ← Back to Campaign
      </Link>

      <h1 className="text-2xl font-semibold mt-2">Analytics</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Delivered" value={analytics?.delivered ?? 0} color="text-green-600" />
        <StatCard label="Opened" value={analytics?.opened ?? 0} color="text-blue-600" />
        <StatCard label="Clicked" value={analytics?.clicked ?? 0} color="text-purple-600" />
        <StatCard label="Bounced" value={analytics?.bounced ?? 0} color="text-yellow-600" />
        <StatCard label="Failed" value={analytics?.failed ?? 0} color="text-red-600" />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  )
}
