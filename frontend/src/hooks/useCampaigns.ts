import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CreateCampaignInput } from '@/types/campaign'

export const campaignKeys = {
  all: ['campaigns'] as const,
  detail: (id: string) => ['campaigns', id] as const,
}

export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.all,
    queryFn: api.campaigns.list,
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => api.campaigns.getById(id),
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCampaignInput) => api.campaigns.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}

export function useSendCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.campaigns.send(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: campaignKeys.all })
    },
  })
}
