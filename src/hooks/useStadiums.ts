import { useEffect, useState } from 'react'
import * as stadiumsApi from '@/lib/api/stadiums'
import type { AppStadium } from '@/lib/api/stadiums'
import { ApiRequestError } from '@/lib/api/client'

interface UseStadiumsResult {
  stadiums: AppStadium[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useStadiums(): UseStadiumsResult {
  const [stadiums, setStadiums] = useState<AppStadium[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    stadiumsApi
      .listStadiums()
      .then((result) => {
        if (cancelled) return
        setStadiums(result.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load stadiums')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return {
    stadiums,
    loading,
    error,
    refetch: () => setReloadToken((token) => token + 1),
  }
}
