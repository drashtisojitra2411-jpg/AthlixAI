import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMO_SCRIPT, type DemoStageId } from '@/lib/demo/script'

export type DemoPhase = 'idle' | 'playing' | 'paused' | 'finished'

interface UseDemoRunnerResult {
  phase: DemoPhase
  stageIndex: number
  stageId: DemoStageId
  stageElapsedMs: number
  stageDurationMs: number
  totalElapsedMs: number
  totalDurationMs: number
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  skip: () => void
}

const TICK_MS = 100
const TOTAL_DURATION_MS = DEMO_SCRIPT.reduce((sum, stage) => sum + stage.durationMs, 0)

export function useDemoRunner(): UseDemoRunnerResult {
  const [phase, setPhase] = useState<DemoPhase>('idle')
  const [stageIndex, setStageIndex] = useState(0)
  const [stageElapsedMs, setStageElapsedMs] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const advanceStage = useCallback(() => {
    setStageIndex((current) => {
      const next = current + 1
      if (next >= DEMO_SCRIPT.length) {
        setPhase('finished')
        return current
      }
      setStageElapsedMs(0)
      return next
    })
  }, [])

  useEffect(() => {
    if (phase !== 'playing') {
      clearTick()
      return
    }

    intervalRef.current = setInterval(() => {
      setStageElapsedMs((elapsed) => {
        const duration = DEMO_SCRIPT[stageIndex].durationMs
        if (elapsed + TICK_MS >= duration) {
          advanceStage()
          return 0
        }
        return elapsed + TICK_MS
      })
    }, TICK_MS)

    return clearTick
  }, [phase, stageIndex, advanceStage, clearTick])

  const start = useCallback(() => {
    setStageIndex(0)
    setStageElapsedMs(0)
    setPhase('playing')
  }, [])

  const pause = useCallback(() => {
    setPhase((current) => (current === 'playing' ? 'paused' : current))
  }, [])

  const resume = useCallback(() => {
    setPhase((current) => (current === 'paused' ? 'playing' : current))
  }, [])

  const restart = useCallback(() => {
    setStageIndex(0)
    setStageElapsedMs(0)
    setPhase('playing')
  }, [])

  const skip = useCallback(() => {
    if (phase === 'idle' || phase === 'finished') return
    advanceStage()
  }, [phase, advanceStage])

  const stage = DEMO_SCRIPT[stageIndex]
  const totalElapsedMs =
    DEMO_SCRIPT.slice(0, stageIndex).reduce((sum, s) => sum + s.durationMs, 0) + stageElapsedMs

  return {
    phase,
    stageIndex,
    stageId: stage.id,
    stageElapsedMs,
    stageDurationMs: stage.durationMs,
    totalElapsedMs,
    totalDurationMs: TOTAL_DURATION_MS,
    start,
    pause,
    resume,
    restart,
    skip,
  }
}
