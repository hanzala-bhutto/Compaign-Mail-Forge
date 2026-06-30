# New Component

Scaffold a new React page or component following the canonical frontend structure for this project.

## Usage

```
/new-component <name> [--page] [--feature <feature-name>]
```

Examples:
- `/new-component CampaignCard --feature campaigns` — a feature component
- `/new-component CampaignsPage --page` — a full route page
- `/new-component useAnalytics --hook` — a custom data hook

## What Gets Created

### For `--page` (e.g. `CampaignsPage`)

**`src/pages/CampaignsPage.tsx`**
```tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { campaignKeys } from '@/hooks/useCampaigns'
import { CampaignCard } from '@/components/campaigns/CampaignCard'
import { Skeleton } from '@/components/ui/skeleton'

export function CampaignsPage() {
    const { data: campaigns, isLoading, error } = useQuery({
        queryKey: campaignKeys.all,
        queryFn: api.campaigns.list,
    })

    if (isLoading) return <CampaignsPageSkeleton />
    if (error) return <p className="text-destructive">Failed to load campaigns.</p>

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-semibold mb-6">Campaigns</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns?.map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
        </div>
    )
}

function CampaignsPageSkeleton() {
    return (
        <div className="container py-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
            </div>
        </div>
    )
}
```

Also add the route to `src/App.tsx` under the correct path.

### For `--feature` component (e.g. `CampaignCard`)

**`src/components/<feature>/<Name>.tsx`**
```tsx
import { Campaign } from '@/types/campaign'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CampaignCardProps {
    campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{campaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                <Badge className="mt-2" variant="secondary">{campaign.status}</Badge>
            </CardContent>
        </Card>
    )
}
```

### For `--hook` (e.g. `useAnalytics`)

**`src/hooks/useAnalytics.ts`**
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CampaignAnalytics } from '@/types/analytics'

export const analyticsKeys = {
    all: ['analytics'] as const,
    byCampaign: (id: string) => ['analytics', id] as const,
}

export function useAnalytics(campaignId: string) {
    return useQuery<CampaignAnalytics>({
        queryKey: analyticsKeys.byCampaign(campaignId),
        queryFn: () => api.analytics.getByCampaign(campaignId),
        enabled: !!campaignId,
    })
}
```

### TypeScript type (if new domain entity)

**`src/types/<entity>.ts`**
```ts
// Mirrors backend JSON exactly — keep in sync with Go struct tags

export interface Campaign {
    id: string
    name: string
    subject: string
    body: string
    audience_id: string
    status: 'draft' | 'scheduled' | 'sent'
    created_at: string // ISO 8601
}

export interface CreateCampaignInput {
    name: string
    subject: string
    body: string
    audience_id: string
}
```

## Rules

- Named exports only — no default exports
- Props interface always defined above the component
- Loading and error states always handled in pages
- No business logic inside JSX — extract to hooks or handler functions
- Run `npm run build` after scaffolding to verify TypeScript compiles
- Follow `/frontend-conventions` for all generated code

## After Scaffolding

- If it's a page: add route to `src/App.tsx` and a nav link in the layout
- If it's a type: check it matches the backend's JSON field names exactly
- If it's a hook: export query keys so other hooks can invalidate them
