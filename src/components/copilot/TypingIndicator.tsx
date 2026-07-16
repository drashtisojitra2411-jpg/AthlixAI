import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl accent-gradient">
        <Bot className="size-4 text-white" />
      </div>
      <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-copilot-border)]/25 bg-[rgba(255,255,255,0.03)] px-4 py-3">
        <span className="text-xs text-text-muted">Athlix AI is analyzing live operations</span>
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-accent"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
