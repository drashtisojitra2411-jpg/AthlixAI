import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface DemoNarrationProps {
  stageId: string
  title: string
  narration: string
}

export function DemoNarration({ stageId, title, narration }: DemoNarrationProps) {
  // No AnimatePresence/exit here: with mode="wait", rapid consecutive stage
  // changes (e.g. the auto-advance timer firing while a Skip is also
  // queued) could leave it stuck displaying a stale exiting child instead
  // of the current stage. A plain keyed remount always shows the right
  // content immediately, with only the low-risk entrance fade kept.
  return (
    <motion.div
      key={stageId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-2xl p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl accent-gradient">
          <Sparkles className="size-4 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-text-primary">{title}</h2>
          <p className="mt-0.5 text-sm text-text-secondary">{narration}</p>
        </div>
      </div>
    </motion.div>
  )
}
