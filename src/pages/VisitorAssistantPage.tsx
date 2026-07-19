import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Inbox, Loader2, Send, Sparkles, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useBookedEventSelector } from '@/hooks/useBookedEventSelector'
import { askVisitorCopilot } from '@/lib/api/copilot'
import { ApiRequestError } from '@/lib/api/client'
import { EventSelect } from '@/components/shared/EventSelect'

interface Turn {
  id: string
  prompt: string
  status: 'pending' | 'done' | 'error'
  answer?: string
  tips?: string[]
  errorMessage?: string
}

const QUICK_PROMPTS = [
  'How busy is it right now?',
  "What's the parking situation?",
  "What's the food court status?",
  'What time does the event start?',
]

export function VisitorAssistantPage() {
  useEffect(() => {
    document.title = 'AI Assistant · ATHLIX'
  }, [])

  const { events, selectedEventId, selectEvent, loading: eventsLoading, error: eventsError } = useBookedEventSelector()
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns])

  const isBusy = turns.some((t) => t.status === 'pending')

  const submitPrompt = async (prompt: string) => {
    if (!prompt.trim() || !selectedEventId || isBusy) return
    const id = crypto.randomUUID()
    setTurns((current) => [...current, { id, prompt, status: 'pending' }])
    setDraft('')

    try {
      const { response } = await askVisitorCopilot(selectedEventId, prompt)
      setTurns((current) =>
        current.map((t) => (t.id === id ? { ...t, status: 'done', answer: response.answer, tips: response.tips } : t)),
      )
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Failed to reach the assistant.'
      setTurns((current) => current.map((t) => (t.id === id ? { ...t, status: 'error', errorMessage: message } : t)))
    }
  }

  return (
    <VisitorShell title="AI Assistant">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">AI Assistant</h1>
          <p className="mt-0.5 text-sm text-text-muted">Ask about parking, food, schedule, and more.</p>
        </div>
        <EventSelect events={events} value={selectedEventId} onChange={selectEvent} />
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
          <h3 className="font-semibold text-text-primary">No upcoming events</h3>
          <p className="max-w-sm text-sm text-text-muted">Book a ticket to ask the assistant about your event.</p>
          <Link to="/visitor/events" className="text-sm text-accent hover:underline">Browse Events</Link>
        </div>
      )}

      {!eventsLoading && !eventsError && events.length > 0 && (
        <div className="glass-card rounded-3xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => submitPrompt(prompt)}
                disabled={isBusy}
                className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3 text-left text-sm text-text-secondary transition-colors hover:bg-[var(--color-surface-hover)] hover:text-text-primary disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="max-h-[480px] space-y-4 overflow-y-auto rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.02)] p-4">
            {turns.length === 0 && (
              <div className="flex flex-col items-center text-center gap-2 py-8">
                <Sparkles className="size-6 text-accent" />
                <p className="text-sm text-text-muted">Ask a quick prompt above or type your own question.</p>
              </div>
            )}

            {turns.map((turn) => (
              <div key={turn.id} className="space-y-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md border border-accent/20 bg-accent/10 px-4 py-2.5 text-sm text-text-primary">
                    {turn.prompt}
                  </div>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-card)]">
                    <User2 className="size-4 text-text-primary" />
                  </div>
                </div>

                {turn.status === 'pending' && (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Loader2 className="size-4 animate-spin" /> Thinking…
                  </div>
                )}

                {turn.status === 'error' && (
                  <div className="flex items-center gap-2 rounded-2xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error">
                    <AlertCircle className="size-4 shrink-0" /> {turn.errorMessage}
                  </div>
                )}

                {turn.status === 'done' && (
                  <div className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl accent-gradient">
                      <Sparkles className="size-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 rounded-2xl border border-[var(--color-copilot-border)]/25 bg-[rgba(255,255,255,0.02)] p-3.5">
                      <p className="text-sm text-text-primary leading-relaxed">{turn.answer}</p>
                      {turn.tips && turn.tips.length > 0 && (
                        <ul className="space-y-1">
                          {turn.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                              <span className="mt-1 size-1 shrink-0 rounded-full bg-accent" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitPrompt(draft)
              }}
              placeholder="Ask about parking, food, schedule…"
              className="h-10 flex-1 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] px-3.5 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            />
            <Button size="sm" className="gap-1.5" disabled={!draft.trim() || isBusy} onClick={() => submitPrompt(draft)}>
              <Send className="size-4" /> Send
            </Button>
          </div>
        </div>
      )}
    </VisitorShell>
  )
}
