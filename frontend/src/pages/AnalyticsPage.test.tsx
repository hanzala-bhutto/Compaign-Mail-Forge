import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { screen, waitFor } from '@testing-library/react'
import { server } from '@/test/msw/server'
import { renderWithRoute } from '@/test/test-utils'
import { AnalyticsPage } from './AnalyticsPage'

describe('AnalyticsPage', () => {
  it('renders analytics stats for a campaign', async () => {
    renderWithRoute(<AnalyticsPage />, {
      path: '/analytics/:id',
      route: '/analytics/camp-1',
    })

    await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument())
    expect(screen.getByText('Delivered')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows an error state when the request fails', async () => {
    server.use(http.get('/api/analytics/campaigns/:id', () => HttpResponse.error()))

    renderWithRoute(<AnalyticsPage />, {
      path: '/analytics/:id',
      route: '/analytics/camp-1',
    })

    await waitFor(() => expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument())
  })
})
