import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, MailOpen, MousePointerClick, AlertTriangle, XCircle, AlertCircle } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { StatCard } from '@/components/analytics/StatCard'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: analytics, isLoading, error } = useAnalytics(id ?? '')

  return (
    <div className="max-w-2xl">
      <Link
        to={`/campaigns/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Campaign
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight mt-2">Analytics</h1>
      <p className="text-sm text-muted-foreground mt-1">How this campaign is performing.</p>

      {isLoading && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3" aria-busy="true">
          <span className="sr-only">Loading analytics...</span>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="font-medium">Failed to load analytics.</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Delivered" value={analytics?.delivered ?? 0} variant="success" icon={Send} />
          <StatCard label="Opened" value={analytics?.opened ?? 0} variant="info" icon={MailOpen} />
          <StatCard label="Clicked" value={analytics?.clicked ?? 0} variant="accent" icon={MousePointerClick} />
          <StatCard label="Bounced" value={analytics?.bounced ?? 0} variant="warning" icon={AlertTriangle} />
          <StatCard label="Failed" value={analytics?.failed ?? 0} variant="destructive" icon={XCircle} />
        </div>
      )}
    </div>
  )
}
