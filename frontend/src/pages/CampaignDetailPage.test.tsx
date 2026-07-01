import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '@/test/msw/server'
import { renderWithRoute } from '@/test/test-utils'
import { CampaignDetailPage } from './CampaignDetailPage'

describe('CampaignDetailPage', () => {
  it('renders campaign details and a send button when draft', async () => {
    renderWithRoute(<CampaignDetailPage />, {
      path: '/campaigns/:id',
      route: '/campaigns/camp-1',
    })

    await waitFor(() => expect(screen.getByText('Launch')).toBeInTheDocument())
    expect(screen.getByText('aud-1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send campaign/i })).toBeInTheDocument()
  })

  it('hides the send button once the campaign is scheduled', async () => {
    server.use(
      http.get('/api/campaigns/:id', () =>
        HttpResponse.json({
          id: 'camp-1',
          name: 'Launch',
          subject: 'Welcome',
          body: 'Hello',
          audience_id: 'aud-1',
          status: 'scheduled',
          created_at: '2026-01-01T00:00:00Z',
        }),
      ),
    )

    renderWithRoute(<CampaignDetailPage />, {
      path: '/campaigns/:id',
      route: '/campaigns/camp-1',
    })

    await waitFor(() => expect(screen.getByText('Launch')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /send campaign/i })).not.toBeInTheDocument()
  })

  it('sends the campaign when the button is clicked', async () => {
    let sendRequestReceived = false
    server.use(
      http.post('/api/campaigns/:id/send', ({ params }) => {
        sendRequestReceived = params.id === 'camp-1'
        return HttpResponse.json({ status: 'scheduled' }, { status: 202 })
      }),
    )

    const user = userEvent.setup()
    renderWithRoute(<CampaignDetailPage />, {
      path: '/campaigns/:id',
      route: '/campaigns/camp-1',
    })

    await waitFor(() => expect(screen.getByText('Launch')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /send campaign/i }))

    await waitFor(() => expect(sendRequestReceived).toBe(true))
  })

  it('shows a not-found state for an unknown campaign', async () => {
    renderWithRoute(<CampaignDetailPage />, {
      path: '/campaigns/:id',
      route: '/campaigns/does-not-exist',
    })

    await waitFor(() => expect(screen.getByText(/campaign not found/i)).toBeInTheDocument())
  })
})
