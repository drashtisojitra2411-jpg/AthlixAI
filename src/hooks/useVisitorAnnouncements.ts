import { useEffect, useState } from 'react'
import * as emergenciesApi from '@/lib/api/emergencies'
import type { VisitorAnnouncement } from '@/lib/api/emergencies'
import { ApiRequestError } from '@/lib/api/client'

interface UseVisitorAnnouncementsResult {
  announcements: VisitorAnnouncement[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVisitorAnnouncements(eventId: string | null): UseVisitorAnnouncementsResult {
  const [announcements, setAnnouncements] = useState<VisitorAnnouncement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!eventId) {
      setAnnouncements([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    emergenciesApi
      .getVisitorAnnouncements(eventId)
      .then((result) => {
        if (cancelled) return
        setAnnouncements(result.announcements)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load announcements')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [eventId, reloadToken])

  return {
    announcements,
    loading,
    error,
    refetch: () => setReloadToken((token) => token + 1),
  }
}
