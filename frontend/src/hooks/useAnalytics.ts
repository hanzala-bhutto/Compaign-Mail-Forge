import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const analyticsKeys = {
  byCampaign: (id: string) => ['analytics', id] as const,
}

export function useAnalytics(campaignId: string) {
  return useQuery({
    queryKey: analyticsKeys.byCampaign(campaignId),
    queryFn: () => api.analytics.getByCampaign(campaignId),
    enabled: !!campaignId,
    refetchInterval: 10_000,
  })
}
