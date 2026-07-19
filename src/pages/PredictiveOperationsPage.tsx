import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Inbox, Loader2, LogOut, Radar, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import { useStadiumRegions } from '@/hooks/useStadiumRegions'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import { StatusLegend } from '@/components/heatmap/StatusLegend'
import { RegionDetailsDrawer } from '@/components/heatmap/RegionDetailsDrawer'
import { EventSelect } from '@/components/shared/EventSelect'
import { ControlPanel } from '@/components/predictive/ControlPanel'
import { PredictionResultCard } from '@/components/predictive/PredictionResultCard'
import { PredictionTimelineCard } from '@/components/predictive/PredictionTimelineCard'
import { PredictionConfidenceCard } from '@/components/predictive/PredictionConfidenceCard'
import { runPrediction, type PredictionResult, type PredictiveControls } from '@/lib/api/predictive'
import { ApiRequestError } from '@/lib/api/client'
import { buildCrowdOverlay } from '@/lib/predictive/overlayMapping'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'

const STAND_REGIONS = STADIUM_REGIONS.filter((region) => region.category === 'stand').map((region) => ({
  id: region.id,
  label: region.label,
}))

const DEFAULT_CONTROLS: PredictiveControls = {
  attendanceChangePercent: 0,
  weather: 'Clear',
  matchImportance: 'Medium',
  openGates: 4,
  parkingAvailabilityPercent: 70,
  securityStaffCount: 40,
  medicalStaffCount: 10,
}

function PredictiveHeader({ eventId, events, onSelectEvent }: {
  eventId: string | null
  events: Array<{ id: string; name: string }>
  onSelectEvent: (id: string) => void
}) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-default)] bg-bg-primary/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard/heatmap" className="flex items-center gap-2.5 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span className="hidden text-sm sm:inline">Heatmap</span>
        </Link>

        <div className="h-6 w-px bg-[var(--color-border-default)]" />

        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg accent-gradient">
            <Radar className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">ATHLIX Predictive Operations</span>
        </div>

        <div className="flex-1" />

        <EventSelect events={events} value={eventId} onChange={onSelectEvent} />

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

export function PredictiveOperationsPage() {
  const [controls, setControls] = useState<PredictiveControls>(DEFAULT_CONTROLS)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
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
  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? null

  const handleSelectRegion = (id: string) => {
    setSelectedRegionId(id)
    setDrawerOpen(true)
  }

  useEffect(() => {
    document.title = 'Predictive Operations · ATHLIX'
  }, [])

  // Switching events invalidates any prior prediction — it was generated
  // against a different event's baseline and must not be shown as if it
  // still applies.
  useEffect(() => {
    setPrediction(null)
    setRunError(null)
  }, [selectedEventId])

  const overlay = useMemo(
    () => (prediction ? buildCrowdOverlay(prediction.crowdShift) : undefined),
    [prediction],
  )

  const handleRun = async () => {
    if (!selectedEventId || running) return
    setRunning(true)
    setRunError(null)
    try {
      const outcome = await runPrediction(selectedEventId, controls, STAND_REGIONS)
      setPrediction(outcome.prediction)
    } catch (err) {
      setRunError(err instanceof ApiRequestError ? err.message : 'Failed to run prediction.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <PredictiveHeader eventId={selectedEventId} events={events} onSelectEvent={selectEvent} />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Predictive Operations</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Simulate hypothetical conditions and preview the projected operational impact.
          </p>
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
              Create an event from the Command Center before running a predictive simulation.
            </p>
            <Link to="/dashboard" className="text-sm text-accent hover:underline">Go to Command Center</Link>
          </div>
        )}

        {!eventsLoading && !eventsError && events.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <ControlPanel
              controls={controls}
              onChange={setControls}
              onRun={handleRun}
              running={running}
              disabled={!selectedEventId || summaryLoading}
            />

            <div className="space-y-4">
              {summaryError && (
                <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
                  <AlertCircle className="size-4 shrink-0" /> {summaryError}
                </div>
              )}
              {runError && (
                <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
                  <AlertCircle className="size-4 shrink-0" /> {runError}
                </div>
              )}

              <div className="flex items-center justify-between">
                <StatusLegend />
                <AnimatePresence mode="wait">
                  {overlay ? (
                    <motion.div
                      key="prediction-mode"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <Badge variant="copilot" className="ml-3 gap-1.5">
                        <Sparkles className="size-3" /> Prediction Mode
                      </Badge>
                    </motion.div>
                  ) : (
                    <motion.div key="live-mode" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                      <Badge variant="live" className="ml-3">LIVE MODE</Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="glass-card rounded-3xl p-4 sm:p-6">
                {summaryLoading ? (
                  <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
                    <Loader2 className="size-4 animate-spin" /> Loading live occupancy…
                  </div>
                ) : (
                  <StadiumMap regions={regions} onSelectRegion={handleSelectRegion} overlay={overlay} />
                )}
              </div>

              {prediction && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <PredictionResultCard prediction={prediction} />
                  <div className="space-y-4">
                    <PredictionTimelineCard timeline={prediction.predictionTimeline} />
                    <PredictionConfidenceCard prediction={prediction} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <RegionDetailsDrawer region={selectedRegion} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
