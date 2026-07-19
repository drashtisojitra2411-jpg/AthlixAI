import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Inbox, Loader2, LogOut, MonitorPlay } from 'lucide-react'
import { DemoControls } from '@/components/demo/DemoControls'
import { DemoModeBanner } from '@/components/demo/DemoModeBanner'
import { DemoNarration } from '@/components/demo/DemoNarration'
import { DemoStageCongestion } from '@/components/demo/DemoStageCongestion'
import { DemoStageEmergency } from '@/components/demo/DemoStageEmergency'
import { DemoStageOverview } from '@/components/demo/DemoStageOverview'
import { DemoStagePrediction } from '@/components/demo/DemoStagePrediction'
import { DemoStageRecommendation } from '@/components/demo/DemoStageRecommendation'
import { RegionDetailsDrawer } from '@/components/heatmap/RegionDetailsDrawer'
import { EventSelect } from '@/components/shared/EventSelect'
import { useAuth } from '@/contexts/useAuth'
import { useDemoRunner } from '@/hooks/useDemoRunner'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useStadiumRegions } from '@/hooks/useStadiumRegions'
import { DEMO_SCRIPT } from '@/lib/demo/script'
import { pickCongestionRegion } from '@/lib/demo/pickCongestionRegion'
import * as eventsApi from '@/lib/api/events'
import type { AppEvent } from '@/lib/api/events'
import { ApiRequestError } from '@/lib/api/client'

function DemoHeader({
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
    <header className="border-b border-[var(--color-border-default)] bg-bg-primary/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span className="hidden text-sm sm:inline">Command Center</span>
        </Link>

        <div className="h-6 w-px bg-[var(--color-border-default)]" />

        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg accent-gradient">
            <MonitorPlay className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">Presentation Mode</span>
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

export function PresentationModePage() {
  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useMyEvents()

  // Presentation Mode is a showcase feature — it should demo whatever live
  // event exists on the platform, not only events the current user happens
  // to own. Falls back to any Live event only once we know the user's own
  // event list is genuinely empty, and reuses that event (never creates one).
  const [liveEvents, setLiveEvents] = useState<AppEvent[]>([])
  const [liveEventsLoading, setLiveEventsLoading] = useState(false)
  const [liveEventsError, setLiveEventsError] = useState<string | null>(null)

  useEffect(() => {
    if (eventsLoading || events.length > 0) return

    let cancelled = false
    setLiveEventsLoading(true)
    setLiveEventsError(null)

    eventsApi
      .listLiveEvents()
      .then((result) => {
        if (cancelled) return
        setLiveEvents(result.items)
        if (result.items.length > 0) {
          selectEvent(result.items[0].id)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLiveEventsError(err instanceof ApiRequestError ? err.message : 'Failed to load live events')
        }
      })
      .finally(() => {
        if (!cancelled) setLiveEventsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [eventsLoading, events.length, selectEvent])

  const usingOwnEvents = events.length > 0
  const demoEvents = usingOwnEvents ? events : liveEvents
  const demoLoading = eventsLoading || (!usingOwnEvents && liveEventsLoading)
  const demoError = eventsError ?? (!usingOwnEvents ? liveEventsError : null)

  const { summary, crowd, parking, loading: summaryLoading, error: summaryError } = useEventOperationalData(selectedEventId)
  const regions = useStadiumRegions(crowd, parking, summary?.generatedAt ?? null)
  const congestionRegion = useMemo(() => pickCongestionRegion(regions), [regions])

  const [drawerRegionId, setDrawerRegionId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRegion = regions.find((region) => region.id === drawerRegionId) ?? null
  const handleSelectRegion = (id: string) => {
    setDrawerRegionId(id)
    setDrawerOpen(true)
  }

  const demo = useDemoRunner()
  const stage = DEMO_SCRIPT[demo.stageIndex]

  useEffect(() => {
    document.title = 'Presentation Mode · ATHLIX'
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      <DemoHeader eventId={selectedEventId} events={demoEvents} onSelectEvent={selectEvent} />
      <DemoModeBanner
        stageIndex={demo.stageIndex}
        stageLabel={demo.phase === 'idle' ? 'Ready to start' : stage.label}
        stageElapsedMs={demo.stageElapsedMs}
        stageDurationMs={demo.stageDurationMs}
      />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Presentation Mode</h1>
            <p className="mt-0.5 text-sm text-text-muted">
              A guided ~75-second walkthrough of crowd congestion, prediction, emergency response, and AI recommendations.
            </p>
          </div>
          <DemoControls
            phase={demo.phase}
            onStart={demo.start}
            onPause={demo.pause}
            onResume={demo.resume}
            onRestart={demo.restart}
            onSkip={demo.skip}
          />
        </motion.div>

        {demoLoading && (
          <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading event data…
          </div>
        )}

        {!demoLoading && demoError && (
          <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
            <AlertCircle className="size-4 shrink-0" /> {demoError}
          </div>
        )}

        {!demoLoading && !demoError && demoEvents.length === 0 && (
          <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-3">
            <Inbox className="size-8 text-text-muted" />
            <h3 className="font-semibold text-text-primary">No live event to demo</h3>
            <p className="max-w-sm text-sm text-text-muted">
              Presentation Mode needs at least one Live event on the platform. Create one and set its status to Live from the Command Center.
            </p>
            <Link to="/dashboard" className="text-sm text-accent hover:underline">Go to Command Center</Link>
          </div>
        )}

        {!demoLoading && !demoError && demoEvents.length > 0 && (
          <div className="space-y-4">
            {summaryError && (
              <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
                <AlertCircle className="size-4 shrink-0" /> {summaryError}
              </div>
            )}

            <DemoNarration stageId={stage.id} title={stage.label} narration={stage.narration} />

            {demo.phase === 'idle' && (
              <DemoStageOverview summary={summary} regions={regions} loading={summaryLoading} onSelectRegion={handleSelectRegion} />
            )}

            {demo.phase !== 'idle' && stage.id === 'overview' && (
              <DemoStageOverview summary={summary} regions={regions} loading={summaryLoading} onSelectRegion={handleSelectRegion} />
            )}

            {demo.phase !== 'idle' && stage.id === 'congestion' && (
              <DemoStageCongestion regions={regions} congestionRegion={congestionRegion} onSelectRegion={handleSelectRegion} />
            )}

            {demo.phase !== 'idle' && stage.id === 'prediction' && (
              <DemoStagePrediction eventId={selectedEventId} regions={regions} congestionRegion={congestionRegion} onSelectRegion={handleSelectRegion} />
            )}

            {demo.phase !== 'idle' && stage.id === 'emergency' && (
              <DemoStageEmergency regions={regions} congestionRegion={congestionRegion} eventId={selectedEventId} onSelectRegion={handleSelectRegion} />
            )}

            {demo.phase !== 'idle' && stage.id === 'recommendation' && (
              <DemoStageRecommendation eventId={selectedEventId} congestionRegion={congestionRegion} />
            )}

            {demo.phase === 'finished' && (
              <div className="glass-card rounded-3xl p-6 text-center">
                <p className="text-sm text-text-secondary">
                  Demo complete. Press <strong className="text-text-primary">Replay</strong> to run it again.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <RegionDetailsDrawer region={drawerRegion} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
