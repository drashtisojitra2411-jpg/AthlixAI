import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  CheckCircle2,
  DoorOpen,
  HeartPulse,
  Loader2,
  Megaphone,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActionState = 'idle' | 'dispatching' | 'done'

interface CommandAction {
  id: string
  label: string
  icon: LucideIcon
}

const COMMAND_ACTIONS: CommandAction[] = [
  { id: 'deploy-security', label: 'Deploy Security', icon: ShieldAlert },
  { id: 'dispatch-medical', label: 'Dispatch Medical Team', icon: HeartPulse },
  { id: 'open-gate', label: 'Open Alternate Gate', icon: DoorOpen },
  { id: 'broadcast', label: 'Broadcast Public Announcement', icon: Megaphone },
  { id: 'notify-authorities', label: 'Notify Authorities', icon: Bell },
]

const SIMULATED_DISPATCH_MS = 1200

interface CommandActionsCardProps {
  disabled: boolean
  /** Reset key — changing it (e.g. on incident switch) clears all simulated action states. */
  resetKey: string | null
}

export function CommandActionsCard({ disabled, resetKey }: CommandActionsCardProps) {
  const [states, setStates] = useState<Record<string, ActionState>>({})

  useEffect(() => {
    setStates({})
  }, [resetKey])

  const trigger = (actionId: string) => {
    setStates((prev) => ({ ...prev, [actionId]: 'dispatching' }))
    window.setTimeout(() => {
      setStates((prev) => ({ ...prev, [actionId]: 'done' }))
    }, SIMULATED_DISPATCH_MS)
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold text-text-primary">Command Actions</div>
        <p className="text-xs text-text-muted mt-0.5">Simulated only — does not modify live data.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {COMMAND_ACTIONS.map((action) => {
          const state = states[action.id] ?? 'idle'
          return (
            <motion.div key={action.id} whileTap={{ scale: 0.97 }}>
              <Button
                variant={state === 'done' ? 'secondary' : 'outline'}
                size="sm"
                className="w-full justify-start gap-2 h-11 text-xs"
                disabled={disabled || state === 'dispatching'}
                onClick={() => trigger(action.id)}
              >
                {state === 'dispatching' ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : state === 'done' ? (
                  <CheckCircle2 className="size-3.5 text-success" />
                ) : (
                  <action.icon className="size-3.5" />
                )}
                <span className={cn('truncate', state === 'done' && 'text-success')}>
                  {state === 'done' ? `${action.label} — Simulated` : action.label}
                </span>
              </Button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
