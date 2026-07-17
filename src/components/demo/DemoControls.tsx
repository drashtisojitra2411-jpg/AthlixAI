import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DemoPhase } from '@/hooks/useDemoRunner'

interface DemoControlsProps {
  phase: DemoPhase
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onSkip: () => void
}

export function DemoControls({ phase, onStart, onPause, onResume, onRestart, onSkip }: DemoControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {phase === 'idle' && (
        <Button variant="primary" size="sm" className="gap-1.5" onClick={onStart}>
          <Play className="size-3.5" /> Start Demo
        </Button>
      )}

      {phase === 'playing' && (
        <Button variant="secondary" size="sm" className="gap-1.5" onClick={onPause}>
          <Pause className="size-3.5" /> Pause
        </Button>
      )}

      {phase === 'paused' && (
        <Button variant="primary" size="sm" className="gap-1.5" onClick={onResume}>
          <Play className="size-3.5" /> Resume
        </Button>
      )}

      {phase === 'finished' && (
        <Button variant="primary" size="sm" className="gap-1.5" onClick={onRestart}>
          <RotateCcw className="size-3.5" /> Replay
        </Button>
      )}

      {phase !== 'idle' && phase !== 'finished' && (
        <>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onSkip}>
            <SkipForward className="size-3.5" /> Skip
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onRestart}>
            <RotateCcw className="size-3.5" /> Restart
          </Button>
        </>
      )}
    </div>
  )
}
