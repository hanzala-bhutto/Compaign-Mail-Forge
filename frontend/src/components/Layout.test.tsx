import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import { Layout } from './Layout'

describe('Layout', () => {
  it('renders the brand name and nav link, and highlights the active route', async () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route path="/campaigns" element={<p>campaigns content</p>} />
        </Route>
      </Routes>,
      { route: '/campaigns' },
    )

    // Desktop sidebar and mobile header both render in the DOM at once (CSS
    // media queries decide which is visible, not React) — assert at least one.
    expect(screen.getAllByText('MailForge').length).toBeGreaterThan(0)

    const sidebar = screen.getByRole('complementary')
    const link = within(sidebar).getByRole('link', { name: 'Campaigns' })
    expect(link).toHaveClass('text-primary')
    expect(await screen.findByText('campaigns content')).toBeInTheDocument()
  })
})
