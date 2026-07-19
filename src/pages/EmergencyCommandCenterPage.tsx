import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Inbox, Loader2, LogOut, RefreshCw, Siren } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AiResponseRecommendations } from '@/components/emergency/AiResponseRecommendations'
import { CommandActionsCard } from '@/components/emergency/CommandActionsCard'
import { EmergencyTimeline } from '@/components/emergency/EmergencyTimeline'
import { IncidentDetailsPanel } from '@/components/emergency/IncidentDetailsPanel'
import { IncidentList } from '@/components/emergency/IncidentList'
import { ReportIncidentDialog } from '@/components/emergency/ReportIncidentDialog'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import { RegionDetailsDrawer } from '@/components/heatmap/RegionDetailsDrawer'
import { EventSelect } from '@/components/shared/EventSelect'
import { useAuth } from '@/contexts/AuthContext'
import { useEmergencyIncidents } from '@/hooks/useEmergencyIncidents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useStadiumRegions } from '@/hooks/useStadiumRegions'
import { ApiRequestError } from '@/lib/api/client'
import * as emergenciesApi from '@/lib/api/emergencies'
import type { EmergencyAiRecommendation, EmergencyStatus } from '@/lib/api/emergencies'
import { SEVERITY_TO_REGION_STATUS } from '@/lib/emergency/incidentTypes'
import { mapIncidentToRegionId } from '@/lib/emergency/regionMapping'
import type { PredictedRegionOverlay } from '@/lib/heatmap/overlay'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'

function EmergencyHeader({
  eventId,
  events,
  onSelectEvent,
}: {
  eventId: string | null
  events: Array<{ id: string; name: string }>
  onSelectEvent: (id: string) => void
}) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-default)] bg-bg-primary/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span className="hidden text-sm sm:inline">Command Center</span>
        </Link>

        <div className="h-6 w-px bg-[var(--color-border-default)]" />

        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-error/15">
            <Siren className="size-4 text-error" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">Emergency Command Center</span>
        </div>

        <div className="flex-1" />

        <EventSelect events={events} value={eventId} onChange={onSelectEvent} />

        <Badge variant="live" className="hidden sm:inline-flex">MONITORING</Badge>

        <button
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="flex size-9 items-center justify-center rounded-xl text-text-muted hover:bg-[var(--color-surface-hover)] hover:text-text-primary transition-colors"
          aria-label="Logout"
          title={user?.fullName}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}

function StatPill({ label, value, tone }: { label: string; value: number; tone: 'default' | 'error' | 'warning' }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-xs text-text-muted">{label}</div>
      <div
        className={
          tone === 'error'
            ? 'mt-1 text-2xl font-bold text-error tabular-nums'
            : tone === 'warning'
              ? 'mt-1 text-2xl font-bold text-warning tabular-nums'
              : 'mt-1 text-2xl font-bold text-text-primary tabular-nums'
        }
      >
        {value}
      </div>
    </div>
  )
}

export function EmergencyCommandCenterPage() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null)
  const [aiRecommendation, setAiRecommendation] = useState<EmergencyAiRecommendation | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [drawerRegionId, setDrawerRegionId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useMyEvents()

  const { summary, crowd, parking, loading: summaryLoading, error: summaryError } = useEventOperationalData(selectedEventId)
  const regions = useStadiumRegions(crowd, parking, summary?.generatedAt ?? null)

  const {
    incidents,
    loading: incidentsLoading,
    error: incidentsError,
    refetch: refetchIncidents,
    createIncident,
    updateStatus,
  } = useEmergencyIncidents(selectedEventId)

  useEffect(() => {
    document.title = 'Emergency Command Center · ATHLIX'
  }, [])

  const activeIncidents = useMemo(
    () => incidents.filter((incident) => incident.status !== 'resolved'),
    [incidents],
  )
  const selectedIncident = incidents.find((incident) => incident._id === selectedIncidentId) ?? null

  const criticalCount = activeIncidents.filter((i) => i.severity === 'critical').length
  const breachedCount = activeIncidents.filter((incident) => {
    const slaMinutes = { critical: 5, high: 15, medium: 30, low: 60 }[incident.severity]
    const elapsed = Math.round((Date.now() - new Date(incident.createdAt).getTime()) / 60000)
    return elapsed > slaMinutes
  }).length

  const selectedRegionId = selectedIncident ? mapIncidentToRegionId(selectedIncident) : null
  const selectedRegionData = selectedRegionId ? regions.find((r) => r.id === selectedRegionId) : null
  const selectedRegionLabel = selectedRegionId
    ? (STADIUM_REGIONS.find((r) => r.id === selectedRegionId)?.label ?? null)
    : null

  const overlay: Record<string, PredictedRegionOverlay> | undefined =
    selectedIncident && selectedRegionId
      ? {
          [selectedRegionId]: {
            predictedOccupancy: selectedRegionData?.occupancyPercent ?? 0,
            status: SEVERITY_TO_REGION_STATUS[selectedIncident.severity],
          },
        }
      : undefined

  const drawerRegion = regions.find((region) => region.id === drawerRegionId) ?? null

  const handleSelectRegion = (id: string) => {
    setDrawerRegionId(id)
    setDrawerOpen(true)
  }

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id)
    setAiRecommendation(null)
    setAiError(null)
  }

  const handleGenerateAi = async () => {
    if (!selectedIncidentId) return
    setAiLoading(true)
    setAiError(null)
    try {
      const { recommendation } = await emergenciesApi.getEmergencyAiRecommendation(selectedIncidentId)
      setAiRecommendation(recommendation)
    } catch (err) {
      setAiError(err instanceof ApiRequestError ? err.message : 'Failed to generate AI recommendation')
    } finally {
      setAiLoading(false)
    }
  }

  const handleUpdateStatus = async (status: EmergencyStatus) => {
    if (!selectedIncidentId) return
    setStatusUpdating(true)
    try {
      await updateStatus(selectedIncidentId, status)
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <EmergencyHeader eventId={selectedEventId} events={events} onSelectEvent={selectEvent} />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Emergency Command Center</h1>
            <p className="mt-0.5 text-sm text-text-muted">
              Live incidents, AI response recommendations, and coordinated dispatch — in one view.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={refetchIncidents}>
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
            {selectedEventId && (
              <ReportIncidentDialog onCreated={(report) => handleSelectIncident(report._id)} onSubmit={createIncident} />
            )}
          </div>
        </motion.div>

        {eventsLoading && (
          <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading your events…
          </div>
        )}

        {!eventsLoading && eventsError && (
          <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
            <AlertCircle className="size-4 shrink-0" /> {eventsError}
          </div>
        )}

        {!eventsLoading && !eventsError && events.length === 0 && (
          <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-3">
            <Inbox className="size-8 text-text-muted" />
            <h3 className="font-semibold text-text-primary">No events yet</h3>
            <p className="max-w-sm text-sm text-text-muted">
              Create an event from the Command Center before tracking emergency response.
            </p>
            <Link to="/dashboard" className="text-sm text-accent hover:underline">Go to Command Center</Link>
          </div>
        )}

        {!eventsLoading && !eventsError && events.length > 0 && (
          <div className="space-y-6">
            {(summaryError || incidentsError) && (
              <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
                <AlertCircle className="size-4 shrink-0" /> {summaryError ?? incidentsError}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatPill label="Active Incidents" value={activeIncidents.length} tone={activeIncidents.length > 0 ? 'warning' : 'default'} />
              <StatPill label="Critical" value={criticalCount} tone={criticalCount > 0 ? 'error' : 'default'} />
              <StatPill label="SLA Breaches" value={breachedCount} tone={breachedCount > 0 ? 'error' : 'default'} />
              <StatPill label="Total Logged" value={incidents.length} tone="default" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 glass-card rounded-3xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-text-primary">Live Stadium Heatmap</h2>
                    <p className="text-xs text-text-muted mt-0.5">
                      {selectedIncident
                        ? selectedRegionLabel
                          ? `Highlighting ${selectedRegionLabel} for the selected incident`
                          : 'Selected incident has no mapped region'
                        : 'Select an incident to highlight its affected region'}
                    </p>
                  </div>
                  {selectedIncident && <Badge variant="live">SELECTED</Badge>}
                </div>
                {summaryLoading ? (
                  <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
                    <Loader2 className="size-4 animate-spin" /> Loading live occupancy…
                  </div>
                ) : (
                  <StadiumMap regions={regions} onSelectRegion={handleSelectRegion} overlay={overlay} />
                )}
              </div>

              <div className="glass-card rounded-3xl p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-text-primary">Incident List</h2>
                  {activeIncidents.length > 0 && <Badge variant="error" className="text-xs">{activeIncidents.length} active</Badge>}
                </div>
                {incidentsLoading ? (
                  <div className="flex items-center gap-2 py-10 justify-center text-sm text-text-muted">
                    <Loader2 className="size-4 animate-spin" /> Loading incidents…
                  </div>
                ) : (
                  <IncidentList incidents={incidents} selectedId={selectedIncidentId} onSelect={handleSelectIncident} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="glass-card rounded-3xl p-4 sm:p-6">
                <h2 className="font-semibold text-text-primary mb-4">Incident Details</h2>
                <IncidentDetailsPanel
                  incident={selectedIncident}
                  regionLabel={selectedRegionLabel}
                  onUpdateStatus={handleUpdateStatus}
                  updating={statusUpdating}
                />
              </div>

              <div className="glass-card rounded-3xl p-4 sm:p-6 border-[var(--color-copilot-border)]/25">
                <AiResponseRecommendations
                  recommendation={aiRecommendation}
                  loading={aiLoading}
                  error={aiError}
                  disabled={!selectedIncident}
                  onGenerate={handleGenerateAi}
                />
              </div>

              <div className="glass-card rounded-3xl p-4 sm:p-6">
                <CommandActionsCard disabled={!selectedIncident} resetKey={selectedIncidentId} />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-4 sm:p-6">
              <h2 className="font-semibold text-text-primary mb-4">Emergency Timeline</h2>
              <EmergencyTimeline incidents={incidents} selectedId={selectedIncidentId} onSelect={handleSelectIncident} />
            </div>
          </div>
        )}
      </main>

      <RegionDetailsDrawer region={drawerRegion} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
