import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AiResponseRecommendations } from '@/components/emergency/AiResponseRecommendations'
import { getDemoEmergencyAiRecommendation, type EmergencyAiRecommendation } from '@/lib/api/emergencies'
import { FALLBACK_RECOMMENDATION } from '@/lib/demo/fallbackData'
import type { DemoCongestionRegion } from '@/lib/demo/pickCongestionRegion'
import { withFallback } from '@/lib/demo/withFallback'

interface DemoStageRecommendationProps {
  eventId: string | null
  congestionRegion: DemoCongestionRegion
}

export function DemoStageRecommendation({ eventId, congestionRegion }: DemoStageRecommendationProps) {
  const [recommendation, setRecommendation] = useState<EmergencyAiRecommendation | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [loading, setLoading] = useState(true)

  const runDemoAi = useCallback(() => {
    setLoading(true)

    const call = eventId
      ? getDemoEmergencyAiRecommendation({
          eventId,
          type: 'crowd-surge',
          severity: 'high',
          location: congestionRegion.label,
          description: `Crowd density in ${congestionRegion.label} has exceeded safe thresholds following sustained inflow, with reports of pushing near the front barriers.`,
        }).then((res) => res.recommendation)
      : Promise.reject(new Error('No event selected'))

    withFallback(call, FALLBACK_RECOMMENDATION).then(({ value, usedFallback: fellBack }) => {
      setRecommendation(value)
      setUsedFallback(fellBack)
      setLoading(false)
    })
  }, [eventId, congestionRegion.label])

  useEffect(() => {
    runDemoAi()
  }, [runDemoAi])

  return (
    <div className="space-y-3">
      {usedFallback && !loading && (
        <Badge variant="outline" className="text-xs">
          Illustrative example — live AI temporarily unavailable
        </Badge>
      )}
      <div className="glass-card rounded-3xl p-4 sm:p-6 border-[var(--color-copilot-border)]/25">
        <AiResponseRecommendations
          recommendation={recommendation}
          loading={loading}
          error={null}
          disabled={false}
          onGenerate={runDemoAi}
        />
      </div>
    </div>
  )
}
