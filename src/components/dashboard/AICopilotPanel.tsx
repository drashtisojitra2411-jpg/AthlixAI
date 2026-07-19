import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, CornerDownLeft, LoaderCircle, MessageSquareQuote, Send, User2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type PlatformIntel,
  type ExecutiveInput,
  type SeatRecommendationInput,
  generateCopilotResponse,
} from '@/lib/copilot/engine'
import type { CopilotInsightCardProps } from '@/lib/copilot/schema'
import { cn } from '@/lib/utils'
import { StructuredAiCard } from './StructuredAiCard'
import { serializeInsight } from './insight-utils'

interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  status?: 'streaming' | 'done'
  response?: CopilotInsightCardProps
  prompt?: string
}

interface AICopilotPanelProps {
  context: ExecutiveInput
  seatInput: SeatRecommendationInput
  platformIntel: PlatformIntel
}

const STORAGE_KEY = 'athlix-copilot-history'

const suggestedPrompts = [
  'What should I do about crowd pressure in the north stand?',
  'Recommend the best parking and gate strategy for the next arrival wave.',
  'Give me an executive summary for the next 30 minutes.',
  'Which seats should I recommend for a premium VIP guest group?',
]

function buildStreamingMarkdown(insight: CopilotInsightCardProps) {
  return [
    '## Recommendation',
    `- ${insight.recommendation}`,
    '',
    '## Prediction',
    `- ${insight.prediction ?? 'No prediction available.'}`,
    '',
    '## Confidence',
    `- ${insight.confidence}%`,
    '',
    '## Suggested Actions',
    ...insight.suggestedActions.map((action) => `- ${action.label}`),
  ].join('\n')
}

export function AICopilotPanel({ context, seatInput, platformIntel }: AICopilotPanelProps) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const ingestedEventIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as CopilotMessage[]
      setMessages(saved)
    } catch {
      setMessages([])
    }
  }, [])

  useEffect(() => {
    if (messages.length === 0) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    const unseenEvents = platformIntel.systemEvents.filter((event) => !ingestedEventIds.current.has(event.id))
    if (unseenEvents.length === 0) return

    setMessages((current) => [
      ...current,
      ...unseenEvents.map((event) => ({
        id: `system-${event.id}`,
        role: 'assistant' as const,
        text: `## ${event.title}\n- ${event.summary}`,
        status: 'done' as const,
        prompt: event.prompt,
        response: generateCopilotResponse(event.prompt, context, seatInput),
      })),
    ])

    unseenEvents.forEach((event) => ingestedEventIds.current.add(event.id))
  }, [context, platformIntel.systemEvents, seatInput])

  const hasStreamingMessage = useMemo(
    () => messages.some((message) => message.status === 'streaming'),
    [messages],
  )

  const streamResponse = async (prompt: string) => {
    const userMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: prompt,
    }

    const assistantId = crypto.randomUUID()
    const assistantMessage: CopilotMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      status: 'streaming',
      prompt,
    }

    setStreamingId(assistantId)
    setMessages((current) => [...current, userMessage, assistantMessage])

    try {
      const response: CopilotInsightCardProps = generateCopilotResponse(prompt, context, seatInput)

      const streamText = buildStreamingMarkdown(response)
      let index = 0

      const timer = window.setInterval(() => {
        index += 3
        const nextText = streamText.slice(0, index)

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, text: nextText } : message,
          ),
        )

        if (index >= streamText.length) {
          window.clearInterval(timer)
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, text: streamText, response, status: 'done' }
                : message,
            ),
          )
          setStreamingId(null)
        }
      }, 18)
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Unknown error'
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                text: `Error: ${errorText}`,
                status: 'done',
              }
            : message,
        ),
      )
      setStreamingId(null)
    }
  }

  const submitPrompt = (prompt: string) => {
    if (!prompt.trim() || hasStreamingMessage) return
    void streamResponse(prompt.trim())
    setDraft('')
  }

  const copyMessage = async (response: CopilotInsightCardProps) => {
    await navigator.clipboard.writeText(serializeInsight(response))
  }

  const regenerate = (prompt: string) => {
    if (hasStreamingMessage) return
    void streamResponse(prompt)
  }

  return (
    <Card className="rounded-3xl border border-[var(--color-copilot-border)]/25">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
              <Bot className="size-5 text-accent" />
              AI Copilot
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              Operational guidance with streaming structured responses, reasoning, and next-step cards.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="copilot" className="w-fit">
              Platform Brain Online
            </Badge>
            <Badge variant="outline" className="w-fit text-text-muted">
              Local Engine
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2 lg:grid-cols-4">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitPrompt(prompt)}
              className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3 text-left text-sm text-text-secondary transition-colors hover:bg-[var(--color-surface-hover)] hover:text-text-primary"
            >
              <div className="flex items-start gap-2">
                <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{prompt}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.02)]">
          <div className="max-h-[640px] space-y-4 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {message.role === 'assistant' && (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl accent-gradient">
                      <Bot className="size-4 text-white" />
                    </div>
                  )}

                  <div className={cn('max-w-[92%] space-y-3', message.role === 'user' ? 'items-end' : '')}>
                    {message.role === 'user' ? (
                      <div className="ml-auto rounded-3xl rounded-tr-md bg-accent/15 px-4 py-3 text-sm text-text-primary border border-accent/20">
                        <div className="mb-1 flex items-center justify-end gap-2 text-[11px] uppercase tracking-[0.18em] text-accent">
                          <User2 className="size-3" />
                          Operator
                        </div>
                        {message.text}
                      </div>
                    ) : message.response ? (
                      <StructuredAiCard
                        insight={message.response}
                        title="Copilot Response"
                        markdownOverride={message.text}
                        onCopy={() => copyMessage(message.response!)}
                        onRegenerate={message.prompt ? () => regenerate(message.prompt!) : undefined}
                      />
                    ) : (
                      <div className="w-full rounded-3xl rounded-tl-md border border-[var(--color-copilot-border)]/25 bg-[rgba(255,255,255,0.03)] p-4">
                        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-accent">
                          <LoaderCircle className="size-3.5 animate-spin" />
                          Streaming response
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-text-secondary">
                          {message.text}
                          {streamingId === message.id && <span className="animate-pulse text-accent">▋</span>}
                        </pre>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-card)]">
                      <User2 className="size-4 text-text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {messages.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[var(--color-border-default)] p-8 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl accent-gradient">
                  <Bot className="size-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">Ask the operations copilot</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  The copilot is already consuming crowd, parking, tournament, emergency, and executive events. Ask for cross-module guidance rather than isolated metrics.
                </p>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--color-border-default)] p-4">
            <div className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                placeholder="Ask ATHLIX Copilot for recommendations, predictions, or an executive summary..."
                className="w-full resize-none bg-transparent px-1 py-1 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <CornerDownLeft className="size-3.5" />
                  Structured output: Recommendation, Prediction, Reason, Confidence, Suggested Actions, Summary
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  disabled={!draft.trim() || hasStreamingMessage}
                  onClick={() => submitPrompt(draft)}
                >
                  <Send className="size-4" />
                  {hasStreamingMessage ? 'Streaming...' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
