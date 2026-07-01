import { Link } from 'react-router-dom'
import { Calendar, Inbox, AlertCircle } from 'lucide-react'
import { useCampaigns } from '@/hooks/useCampaigns'
import { StatusBadge } from '@/components/campaigns/StatusBadge'
import { NewCampaignDialog } from '@/components/campaigns/NewCampaignDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CampaignsPage() {
  const { data: campaigns, isLoading, error } = useCampaigns()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and send your email campaigns.</p>
        </div>
        <NewCampaignDialog />
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <span className="sr-only">Loading campaigns...</span>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="font-medium">Failed to load campaigns.</p>
        </div>
      )}

      {!isLoading && !error && campaigns?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No campaigns yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first campaign to get started.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && campaigns && campaigns.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <Link key={c.id} to={`/campaigns/${c.id}`} className="block">
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{c.name}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 truncate">{c.subject}</p>
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
