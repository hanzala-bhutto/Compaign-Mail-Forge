import { http, HttpResponse } from 'msw'
import type { Campaign } from '@/types/campaign'
import type { CampaignAnalytics } from '@/types/analytics'

export const mockCampaign: Campaign = {
  id: 'camp-1',
  name: 'Launch',
  subject: 'Welcome',
  body: 'Hello there',
  audience_id: 'aud-1',
  status: 'draft',
  created_at: '2026-01-01T00:00:00Z',
}

export const mockAnalytics: CampaignAnalytics = {
  campaign_id: 'camp-1',
  delivered: 100,
  opened: 42,
  clicked: 10,
  bounced: 2,
  failed: 1,
}

export const handlers = [
  http.get('/api/campaigns', () => HttpResponse.json([mockCampaign])),

  http.get('/api/campaigns/:id', ({ params }) => {
    if (params.id !== mockCampaign.id) {
      return HttpResponse.json({ error: 'campaign not found' }, { status: 404 })
    }
    return HttpResponse.json(mockCampaign)
  }),

  http.post('/api/campaigns', async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    return HttpResponse.json(
      { ...mockCampaign, id: 'camp-new', status: 'draft', ...body },
      { status: 201 },
    )
  }),

  http.post('/api/campaigns/:id/send', ({ params }) => {
    if (params.id !== mockCampaign.id) {
      return HttpResponse.json({ error: 'campaign not found' }, { status: 404 })
    }
    return HttpResponse.json({ status: 'scheduled' }, { status: 202 })
  }),

  http.get('/api/analytics/campaigns/:id', ({ params }) => {
    if (params.id !== mockCampaign.id) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 })
    }
    return HttpResponse.json(mockAnalytics)
  }),
]
