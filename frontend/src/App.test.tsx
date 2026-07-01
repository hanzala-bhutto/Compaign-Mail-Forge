import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

function renderApp(route: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('App routing', () => {
  it('redirects the index route to /campaigns', async () => {
    renderApp('/')
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Campaigns' })).toBeInTheDocument(),
    )
  })

  it('renders the campaign detail route', async () => {
    renderApp('/campaigns/camp-1')
    await waitFor(() => expect(screen.getByText('Launch')).toBeInTheDocument())
  })

  it('renders the analytics route', async () => {
    renderApp('/analytics/camp-1')
    await waitFor(() => expect(screen.getByText('Analytics')).toBeInTheDocument())
  })
})
