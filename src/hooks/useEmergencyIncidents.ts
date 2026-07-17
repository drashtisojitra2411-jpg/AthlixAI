import { useCallback, useEffect, useState } from 'react'
import { ApiRequestError } from '@/lib/api/client'
import * as emergenciesApi from '@/lib/api/emergencies'
import type { EmergencyReport, EmergencyStatus, ReportEmergencyInput } from '@/lib/api/emergencies'

interface UseEmergencyIncidentsResult {
  incidents: EmergencyReport[]
  loading: boolean
  error: string | null
  refetch: () => void
  createIncident: (input: Omit<ReportEmergencyInput, 'event'>) => Promise<EmergencyReport>
  updateStatus: (id: string, status: EmergencyStatus) => Promise<EmergencyReport>
}

export function useEmergencyIncidents(eventId: string | null): UseEmergencyIncidentsResult {
  const [incidents, setIncidents] = useState<EmergencyReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!eventId) {
      setIncidents([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    emergenciesApi
      .listEmergencyReportsByEvent(eventId)
      .then((result) => {
        if (cancelled) return
        setIncidents(result.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load incidents')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [eventId, reloadToken])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  const createIncident = useCallback(
    async (input: Omit<ReportEmergencyInput, 'event'>) => {
      if (!eventId) throw new Error('No event selected')
      const { report } = await emergenciesApi.reportEmergency({ ...input, event: eventId })
      setIncidents((prev) => [report, ...prev])
      return report
    },
    [eventId],
  )

  const updateStatus = useCallback(async (id: string, status: EmergencyStatus) => {
    const { report } = await emergenciesApi.updateEmergencyStatus(id, status)
    setIncidents((prev) => prev.map((incident) => (incident._id === id ? report : incident)))
    return report
  }, [])

  return { incidents, loading, error, refetch, createIncident, updateStatus }
}
