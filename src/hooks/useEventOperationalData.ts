import { useCallback, useEffect, useState } from 'react'
import * as dashboardApi from '@/lib/api/dashboard'
import type { EventOperationalSummary } from '@/lib/api/dashboard'
import * as tournamentsApi from '@/lib/api/tournaments'
import { ApiRequestError } from '@/lib/api/client'
import type { CrowdZoneInput, ParkingInput, TournamentInput } from '@/lib/copilot/engine'

interface UseEventOperationalDataResult {
  summary: EventOperationalSummary | null
  crowd: CrowdZoneInput[]
  parking: ParkingInput[]
  tournamentSchedule: TournamentInput[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useEventOperationalData(eventId: string | null): UseEventOperationalDataResult {
  const [summary, setSummary] = useState<EventOperationalSummary | null>(null)
  const [tournamentSchedule, setTournamentSchedule] = useState<TournamentInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!eventId) {
      setSummary(null)
      setTournamentSchedule([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      dashboardApi.getEventOperationalSummary(eventId),
      tournamentsApi.listByEvent(eventId),
    ])
      .then(([summaryResult, tournamentsResult]) => {
        if (cancelled) return
        setSummary(summaryResult.summary)

        const matches: TournamentInput[] = tournamentsResult.items
          .flatMap((tournament) =>
            tournament.matches.map((match) => ({
              time: match.time,
              event: `${match.teamA} vs ${match.teamB}`,
              status: match.status,
              venue: match.venue,
            })),
          )
          .sort((a, b) => a.time.localeCompare(b.time))

        setTournamentSchedule(matches)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load operational data')
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

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  return { summary, crowd, parking, tournamentSchedule, loading, error, refetch }
}
