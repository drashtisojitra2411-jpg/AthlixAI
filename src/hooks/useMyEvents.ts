import { useCallback, useEffect, useState } from 'react'
import * as eventsApi from '@/lib/api/events'
import type { AppEvent, CreateEventInput } from '@/lib/api/events'
import { ApiRequestError } from '@/lib/api/client'

interface UseMyEventsResult {
  events: AppEvent[]
  selectedEventId: string | null
  selectedEvent: AppEvent | null
  selectEvent: (eventId: string) => void
  loading: boolean
  error: string | null
  creating: boolean
  createError: string | null
  createEvent: (input: CreateEventInput) => Promise<void>
  refetch: () => void
}

export function useMyEvents(): UseMyEventsResult {
  const [events, setEvents] = useState<AppEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    eventsApi
      .listMyEvents()
      .then((result) => {
        if (cancelled) return
        setEvents(result.items)
        setSelectedEventId((current) =>
          current && result.items.some((event) => event.id === current)
            ? current
            : (result.items[0]?.id ?? null),
        )
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
  }, [reloadToken])

  const createEvent = useCallback(async (input: CreateEventInput) => {
    setCreating(true)
    setCreateError(null)
    try {
      const { event } = await eventsApi.createEvent(input)
      setEvents((prev) => [event, ...prev])
      setSelectedEventId(event.id)
    } catch (err) {
      setCreateError(err instanceof ApiRequestError ? err.message : 'Failed to create event')
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null

  return {
    events,
    selectedEventId,
    selectedEvent,
    selectEvent: setSelectedEventId,
    loading,
    error,
    creating,
    createError,
    createEvent,
    refetch: () => setReloadToken((token) => token + 1),
  }
}
