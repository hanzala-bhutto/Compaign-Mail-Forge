import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import { server } from '@/test/msw/server'
import { renderWithProviders } from '@/test/test-utils'
import { CampaignsPage } from './CampaignsPage'

describe('CampaignsPage', () => {
  it('shows a loading state, then the campaign list', async () => {
    renderWithProviders(<CampaignsPage />)

    expect(screen.getByText(/loading campaigns/i)).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Launch')).toBeInTheDocument())
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('shows an empty state when there are no campaigns', async () => {
    server.use(http.get('/api/campaigns', () => HttpResponse.json([])))

    renderWithProviders(<CampaignsPage />)

    await waitFor(() => expect(screen.getByText(/no campaigns yet/i)).toBeInTheDocument())
  })

  it('shows an error state when the request fails', async () => {
    server.use(http.get('/api/campaigns', () => HttpResponse.error()))

    renderWithProviders(<CampaignsPage />)

    await waitFor(() => expect(screen.getByText(/failed to load campaigns/i)).toBeInTheDocument())
  })
})
