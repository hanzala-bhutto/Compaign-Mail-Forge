import { Link } from 'react-router-dom'
import { useCampaigns } from '@/hooks/useCampaigns'
import { cn } from '@/lib/utils'

export function CampaignsPage() {
  const { data: campaigns, isLoading, error } = useCampaigns()

  if (isLoading) return <p className="text-muted-foreground">Loading campaigns...</p>
  if (error) return <p className="text-destructive">Failed to load campaigns.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
      </div>

      {campaigns?.length === 0 && (
        <p className="text-muted-foreground">No campaigns yet.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns?.map((c) => (
          <Link
            key={c.id}
            to={`/campaigns/${c.id}`}
            className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm">{c.name}</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-muted-foreground text-sm mt-1 truncate">{c.subject}</p>
            <p className="text-xs text-muted-foreground mt-3">
              {new Date(c.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'text-xs px-2 py-0.5 rounded-full font-medium',
        status === 'sent' && 'bg-green-100 text-green-700',
        status === 'scheduled' && 'bg-yellow-100 text-yellow-700',
        status === 'draft' && 'bg-muted text-muted-foreground',
      )}
    >
      {status}
    </span>
  )
}
