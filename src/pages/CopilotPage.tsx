import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Inbox, Loader2, LogOut, Sparkles, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import { askCopilot } from '@/lib/api/copilot'
import { ApiRequestError } from '@/lib/api/client'
import { LiveContextPanel, type LiveContextData } from '@/components/copilot/LiveContextPanel'
import { CommandBar } from '@/components/copilot/CommandBar'
import { ConversationCard, type ConversationTurn } from '@/components/copilot/ConversationCard'
import { EventSelect } from '@/components/shared/EventSelect'

// Same illustrative weather source DashboardPage.tsx uses — no backend weather API exists.
const WEATHER = { temp: 28, condition: 'Partly Cloudy' }

function CopilotHeader({ eventId, events, onSelectEvent }: {
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
          <div className="flex size-8 items-center justify-center rounded-lg accent-gradient">
            <Zap className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">ATHLIX AI Copilot</span>
        </div>

        <div className="flex-1" />

        <EventSelect events={events} value={eventId} onChange={onSelectEvent} />

        <Badge variant="live" className="hidden sm:inline-flex">MATCH LIVE</Badge>

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

export function CopilotPage() {
  const [turns, setTurns] = useState<ConversationTurn[]>([])
  const endRef = useRef<HTMLDivElement | null>(null)

  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useMyEvents()

  const { summary, crowd, loading: summaryLoading, error: summaryError } = useEventOperationalData(selectedEventId)

  useEffect(() => {
    document.title = 'AI Copilot · ATHLIX'
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns])

  const contextData: LiveContextData | null = useMemo(() => {
    if (!summary) return null

    const attendance = crowd.reduce((sum, zone) => sum + zone.count, 0)
    const revenue = summary.seating.topRecommendations.reduce(
      (sum, rec) => sum + rec.pricePerSeat * rec.groupSize,
      0,
    )
    const securityAlerts = summary.emergency.activeReports.filter((r) => r.type === 'security').length
    const medicalAlerts = summary.emergency.activeReports.filter((r) => r.type === 'medical').length

    return {
      eventName: summary.event.name,
      eventStatus: summary.event.status,
      attendance,
      crowdPercentage: summary.crowd.averageCapacity,
      parkingPercentage: summary.parking.overallOccupancyRate,
      securityAlerts,
      medicalAlerts,
      revenue,
      weatherCondition: WEATHER.condition,
      weatherTemp: WEATHER.temp,
    }
  }, [summary, crowd])

  const isBusy = turns.some((turn) => turn.status === 'pending')

  const handleSubmit = async (prompt: string) => {
    if (!selectedEventId) return

    const id = crypto.randomUUID()
    setTurns((current) => [...current, { id, prompt, status: 'pending' }])

    try {
      const weather = `${WEATHER.condition}, ${WEATHER.temp}°C`
      const { response } = await askCopilot(selectedEventId, prompt, weather)
      setTurns((current) =>
        current.map((turn) => (turn.id === id ? { ...turn, status: 'done', result: response } : turn)),
      )
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Failed to reach Athlix AI Copilot.'
      setTurns((current) =>
        current.map((turn) => (turn.id === id ? { ...turn, status: 'error', errorMessage: message } : turn)),
      )
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <CopilotHeader eventId={selectedEventId} events={events} onSelectEvent={selectEvent} />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">AI Operations Copilot</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Ask questions grounded in live event data — crowd, parking, security, and more.
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
              Create an event from the Command Center to start asking the copilot about live operations.
            </p>
            <Link to="/dashboard" className="text-sm text-accent hover:underline">Go to Command Center</Link>
          </div>
        )}

        {!eventsLoading && !eventsError && events.length > 0 && (
          <>
            {summaryError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
                <AlertCircle className="size-4 shrink-0" /> {summaryError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-4">
                <div className="glass-card rounded-3xl p-4">
                  <div className="max-h-[560px] space-y-5 overflow-y-auto p-2">
                    {turns.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-[var(--color-border-default)] p-8 text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl accent-gradient">
                          <Sparkles className="size-5 text-white" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-text-primary">
                          Ask the operations copilot
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-text-muted">
                          Use a quick prompt below or type your own question about today's operations.
                        </p>
                      </div>
                    ) : (
                      turns.map((turn) => <ConversationCard key={turn.id} turn={turn} />)
                    )}
                    <div ref={endRef} />
                  </div>
                </div>

                <CommandBar onSubmit={handleSubmit} disabled={isBusy || !selectedEventId} />
              </div>

              <LiveContextPanel data={contextData} loading={summaryLoading} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
