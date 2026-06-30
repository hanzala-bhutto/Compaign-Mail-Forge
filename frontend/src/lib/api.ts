import type { Campaign, CreateCampaignInput } from '@/types/campaign'
import type { CampaignAnalytics } from '@/types/analytics'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, body.error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export const api = {
  campaigns: {
    list: (): Promise<Campaign[]> =>
      request<Campaign[]>('/campaigns'),

    getById: (id: string): Promise<Campaign> =>
      request<Campaign>(`/campaigns/${id}`),

    create: (input: CreateCampaignInput): Promise<Campaign> =>
      request<Campaign>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    send: (id: string): Promise<void> =>
      request<void>(`/campaigns/${id}/send`, { method: 'POST' }),
  },

  analytics: {
    getByCampaign: (id: string): Promise<CampaignAnalytics> =>
      request<CampaignAnalytics>(`/analytics/campaigns/${id}`),
  },
}
