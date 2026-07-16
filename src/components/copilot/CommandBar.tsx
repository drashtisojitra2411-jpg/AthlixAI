import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuickPrompt {
  label: string
  prompt: string
}

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: 'Crowd', prompt: "What's the current crowd status and are there any risk zones?" },
  { label: 'Parking', prompt: "What's the current parking situation and what should we do about it?" },
  { label: 'Security', prompt: 'Are there any active security alerts I should know about?' },
  { label: 'Emergency', prompt: 'Summarize current emergency readiness and any active incidents.' },
  { label: 'Revenue', prompt: 'Give me a summary of current revenue performance.' },
  { label: 'Attendance', prompt: 'What is the current attendance and how is it trending?' },
]

interface CommandBarProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
}

export function CommandBar({ onSubmit, disabled }: CommandBarProps) {
  const [draft, setDraft] = useState('')

  const submit = () => {
    const trimmed = draft.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setDraft('')
  }

  return (
    <div className="glass-card rounded-3xl p-4">
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => setDraft(chip.prompt)}
            className="rounded-full border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/30 hover:bg-[var(--color-copilot-surface)] hover:text-accent"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-3 py-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="Ask Athlix AI about today's operations..."
          className="h-9 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          disabled={disabled}
        />
        <Button size="sm" className="gap-1.5" disabled={!draft.trim() || disabled} onClick={submit}>
          <Send className="size-3.5" />
          {disabled ? 'Analyzing…' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
