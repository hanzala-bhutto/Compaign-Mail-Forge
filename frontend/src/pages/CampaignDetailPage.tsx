import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Calendar, Info, Send, BarChart3, AlertCircle } from 'lucide-react'
import { useCampaign, useSendCampaign } from '@/hooks/useCampaigns'
import { DetailRow } from '@/components/campaigns/DetailRow'
import { StatusBadge } from '@/components/campaigns/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: campaign, isLoading, error } = useCampaign(id ?? '')
  const sendMutation = useSendCampaign()

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4" aria-busy="true">
        <span className="sr-only">Loading campaign...</span>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="font-medium">Campaign not found.</p>
      </div>
    )
  }

  const canSend = campaign.status === 'draft'

  return (
    <div className="max-w-2xl">
      <Link
        to="/campaigns"
        className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <div className="flex items-start justify-between gap-4 mt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
          <p className="text-muted-foreground mt-1">{campaign.subject}</p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <DetailRow label="Audience" value={campaign.audience_id} icon={User} />
          <DetailRow label="Created" value={new Date(campaign.created_at).toLocaleString()} icon={Calendar} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            Body
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.body}</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        {canSend && (
          <Button onClick={() => sendMutation.mutate(campaign.id)} disabled={sendMutation.isPending}>
            <Send className="h-4 w-4" />
            {sendMutation.isPending ? 'Scheduling...' : 'Send Campaign'}
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to={`/analytics/${campaign.id}`}>
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Link>
        </Button>
      </div>
    </div>
  )
}
