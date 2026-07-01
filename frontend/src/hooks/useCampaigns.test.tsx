import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useCampaign, useCampaigns, useCreateCampaign, useSendCampaign } from './useCampaigns'
import { mockCampaign } from '@/test/msw/handlers'

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useCampaigns', () => {
  it('fetches the campaign list', async () => {
    const { result } = renderHook(() => useCampaigns(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockCampaign])
  })
})

describe('useCampaign', () => {
  it('fetches a single campaign by id', async () => {
    const { result } = renderHook(() => useCampaign('camp-1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockCampaign)
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useCampaign(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateCampaign', () => {
  it('creates a campaign', async () => {
    const { result } = renderHook(() => useCreateCampaign(), { wrapper })

    result.current.mutate({ name: 'New', subject: 'Hi', body: 'Body', audience_id: 'aud-2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.name).toBe('New')
  })
})

describe('useSendCampaign', () => {
  it('sends a campaign', async () => {
    const { result } = renderHook(() => useSendCampaign(), { wrapper })

    result.current.mutate('camp-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
