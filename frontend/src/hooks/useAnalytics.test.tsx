import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useAnalytics } from './useAnalytics'
import { mockAnalytics } from '@/test/msw/handlers'

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useAnalytics', () => {
  it('fetches analytics for a campaign', async () => {
    const { result } = renderHook(() => useAnalytics('camp-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockAnalytics)
  })

  it('does not fetch when campaignId is empty', () => {
    const { result } = renderHook(() => useAnalytics(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})
