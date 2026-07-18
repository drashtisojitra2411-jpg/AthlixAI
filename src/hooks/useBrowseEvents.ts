import { useEffect, useState } from 'react'
import * as eventsApi from '@/lib/api/events'
import type { BrowsableEvent, BrowseEventsFilters } from '@/lib/api/events'
import { ApiRequestError } from '@/lib/api/client'

interface UseBrowseEventsResult {
  events: BrowsableEvent[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useBrowseEvents(filters: BrowseEventsFilters): UseBrowseEventsResult {
  const [events, setEvents] = useState<BrowsableEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    eventsApi
      .listBrowseEvents(filters)
      .then((result) => {
        if (cancelled) return
        setEvents(result.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load events')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.stadiumId, filters.from, filters.to, reloadToken])

  return {
    events,
    loading,
    error,
    refetch: () => setReloadToken((token) => token + 1),
  }
}
