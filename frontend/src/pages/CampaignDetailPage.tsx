import { useParams, Link } from 'react-router-dom'
import { useCampaign, useSendCampaign } from '@/hooks/useCampaigns'

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: campaign, isLoading, error } = useCampaign(id ?? '')
  const sendMutation = useSendCampaign()

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>
  if (error || !campaign) return <p className="text-destructive">Campaign not found.</p>

  const canSend = campaign.status === 'draft'

  return (
    <div className="max-w-2xl">
      <Link to="/campaigns" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
        ← Back
      </Link>

      <h1 className="text-2xl font-semibold mt-2">{campaign.name}</h1>
      <p className="text-muted-foreground mt-1">{campaign.subject}</p>

      <div className="mt-6 rounded-lg border p-4 text-sm space-y-2">
        <Row label="Status" value={campaign.status} />
        <Row label="Audience" value={campaign.audience_id} />
        <Row label="Created" value={new Date(campaign.created_at).toLocaleString()} />
      </div>

      <div className="mt-4 rounded-lg border p-4">
        <p className="text-sm font-medium mb-2">Body</p>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.body}</p>
      </div>

      <div className="mt-6 flex gap-3">
        {canSend && (
          <button
            onClick={() => sendMutation.mutate(campaign.id)}
            disabled={sendMutation.isPending}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {sendMutation.isPending ? 'Scheduling...' : 'Send Campaign'}
          </button>
        )}
        <Link
          to={`/analytics/${campaign.id}`}
          className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
        >
          View Analytics
        </Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-muted-foreground w-24 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  )
}
