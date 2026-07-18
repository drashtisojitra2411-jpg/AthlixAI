import { useEffect, useState } from 'react'
import * as dashboardApi from '@/lib/api/dashboard'
import type { VisitorEventSummary } from '@/lib/api/dashboard'
import { ApiRequestError } from '@/lib/api/client'
import type { CrowdZoneInput, ParkingInput } from '@/lib/copilot/engine'

interface UseVisitorEventSummaryResult {
  summary: VisitorEventSummary | null
  crowd: CrowdZoneInput[]
  parking: ParkingInput[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVisitorEventSummary(eventId: string | null): UseVisitorEventSummaryResult {
  const [summary, setSummary] = useState<VisitorEventSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!eventId) {
      setSummary(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    dashboardApi
      .getVisitorEventSummary(eventId)
      .then((result) => {
        if (cancelled) return
        setSummary(result.summary)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load event data')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [eventId, reloadToken])

  const crowd: CrowdZoneInput[] =
    summary?.crowd.zones.map((zone) => ({
      zone: zone.zone,
      capacity: zone.capacity,
      count: zone.currentCount,
      max: zone.maxCount,
      status: zone.status,
    })) ?? []

  const parking: ParkingInput[] =
    summary?.parking.lots.map((lot) => ({
      lot: lot.lot,
      total: lot.totalSpaces,
      occupied: lot.occupiedSpaces,
      status: lot.status,
      walkingMinutes: lot.walkingMinutes,
      gate: lot.gate,
      trafficLevel: lot.trafficLevel,
    })) ?? []

  return {
    summary,
    crowd,
    parking,
    loading,
    error,
    refetch: () => setReloadToken((token) => token + 1),
  }
}
