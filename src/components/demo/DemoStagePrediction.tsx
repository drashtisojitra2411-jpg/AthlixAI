import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import { PredictionConfidenceCard } from '@/components/predictive/PredictionConfidenceCard'
import { PredictionResultCard } from '@/components/predictive/PredictionResultCard'
import { PredictionTimelineCard } from '@/components/predictive/PredictionTimelineCard'
import { runPrediction, type PredictionResult } from '@/lib/api/predictive'
import { FALLBACK_PREDICTION } from '@/lib/demo/fallbackData'
import type { DemoCongestionRegion } from '@/lib/demo/pickCongestionRegion'
import { withFallback } from '@/lib/demo/withFallback'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'
import { buildCrowdOverlay } from '@/lib/predictive/overlayMapping'

const STAND_REGIONS = STADIUM_REGIONS.filter((region) => region.category === 'stand').map((region) => ({
  id: region.id,
  label: region.label,
}))

interface DemoStagePredictionProps {
  eventId: string | null
  regions: StadiumRegionData[]
  congestionRegion: DemoCongestionRegion
}

export function DemoStagePrediction({ eventId, regions, congestionRegion }: DemoStagePredictionProps) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    if (!eventId) {
      setPrediction(FALLBACK_PREDICTION)
      setUsedFallback(true)
      setLoading(false)
      return
    }

    setLoading(true)
    withFallback(
      runPrediction(
        eventId,
        {
          attendanceChangePercent: 25,
          weather: 'Clear',
          matchImportance: 'High',
          openGates: 2,
          parkingAvailabilityPercent: 40,
          securityStaffCount: 15,
          medicalStaffCount: 5,
        },
        STAND_REGIONS,
      ).then((outcome) => outcome.prediction),
      FALLBACK_PREDICTION,
      // This schema is the heaviest of the three Gemini calls (crowdShift
      // across up to 10 regions, a 4-stage timeline, several risk fields);
      // real responses regularly took 9-15s under testing, well past the
      // 8s default — that made the "illustrative example" fallback fire
      // on most runs instead of the rare occasion it's meant for.
      13_000,
    ).then(({ value, usedFallback: fellBack }) => {
      if (cancelled) return
      setPrediction(value)
      setUsedFallback(fellBack)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [eventId])

  const overlay = prediction ? buildCrowdOverlay(prediction.crowdShift) : undefined

  return (
    <div className="space-y-4">
      {usedFallback && !loading && (
        <Badge variant="outline" className="text-xs">
          Illustrative example — live AI temporarily unavailable
        </Badge>
      )}

      <div className="glass-card rounded-3xl p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" /> Simulating conditions for {congestionRegion.label}…
          </div>
        ) : (
          <StadiumMap regions={regions} onSelectRegion={() => {}} overlay={overlay} />
        )}
      </div>

      {prediction && !loading && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <PredictionResultCard prediction={prediction} />
          <div className="space-y-4">
            <PredictionTimelineCard timeline={prediction.predictionTimeline} />
            <PredictionConfidenceCard prediction={prediction} />
          </div>
        </div>
      )}
    </div>
  )
}
