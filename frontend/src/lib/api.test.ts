import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw/server'
import { mockCampaign, mockAnalytics } from '@/test/msw/handlers'
import { api } from './api'

describe('api.campaigns', () => {
  it('lists campaigns', async () => {
    const campaigns = await api.campaigns.list()
    expect(campaigns).toEqual([mockCampaign])
  })

  it('gets a campaign by id', async () => {
    const campaign = await api.campaigns.getById('camp-1')
    expect(campaign).toEqual(mockCampaign)
  })

  it('creates a campaign', async () => {
    const created = await api.campaigns.create({
      name: 'New',
      subject: 'Hi',
      body: 'Body',
      audience_id: 'aud-2',
    })
    expect(created.name).toBe('New')
    expect(created.id).toBe('camp-new')
  })

  it('sends a campaign', async () => {
    await expect(api.campaigns.send('camp-1')).resolves.toBeDefined()
  })

  it('throws ApiError with server message on non-2xx response', async () => {
    server.use(
      http.get('/api/campaigns/:id', () =>
        HttpResponse.json({ error: 'campaign not found' }, { status: 404 }),
      ),
    )

    await expect(api.campaigns.getById('missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'campaign not found',
    })
  })

  it('falls back to statusText when the error body is not JSON', async () => {
    server.use(
      http.get('/api/campaigns/:id', () => new HttpResponse('oops', { status: 500 })),
    )

    await expect(api.campaigns.getById('camp-1')).rejects.toMatchObject({
      status: 500,
    })
  })
})

describe('api.analytics', () => {
  it('gets analytics for a campaign', async () => {
    const analytics = await api.analytics.getByCampaign('camp-1')
    expect(analytics).toEqual(mockAnalytics)
  })
})
