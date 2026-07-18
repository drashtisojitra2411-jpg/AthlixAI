import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { IncidentDetailsPanel } from '@/components/emergency/IncidentDetailsPanel'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import type { EmergencyReport, EmergencyStatus } from '@/lib/api/emergencies'
import type { DemoCongestionRegion } from '@/lib/demo/pickCongestionRegion'
import { SEVERITY_TO_REGION_STATUS } from '@/lib/emergency/incidentTypes'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import type { PredictedRegionOverlay } from '@/lib/heatmap/overlay'

interface DemoStageEmergencyProps {
  regions: StadiumRegionData[]
  congestionRegion: DemoCongestionRegion
  eventId: string | null
  onSelectRegion: (id: string) => void
}

function buildDemoIncident(
  congestionRegion: DemoCongestionRegion,
  eventId: string | null,
  status: EmergencyStatus,
): EmergencyReport {
  const now = new Date().toISOString()
  return {
    _id: 'demo-incident',
    event: eventId ?? 'demo-event',
    type: 'crowd-surge',
    severity: 'high',
    status,
    location: congestionRegion.label,
    description: `Crowd density in ${congestionRegion.label} has exceeded safe thresholds following sustained inflow, with reports of pushing near the front barriers.`,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
  }
}

export function DemoStageEmergency({ regions, congestionRegion, eventId, onSelectRegion }: DemoStageEmergencyProps) {
  const [status, setStatus] = useState<EmergencyStatus>('reported')
  const incident = useMemo(
    () => buildDemoIncident(congestionRegion, eventId, status),
    [congestionRegion, eventId, status],
  )

  const overlay: Record<string, PredictedRegionOverlay> = {
    [congestionRegion.id]: {
      predictedOccupancy: congestionRegion.occupancyPercent,
      status: SEVERITY_TO_REGION_STATUS[incident.severity],
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 glass-card rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Live Stadium Heatmap</h2>
          <Badge variant="error">INCIDENT</Badge>
        </div>
        <StadiumMap regions={regions} onSelectRegion={onSelectRegion} overlay={overlay} />
      </div>

      <div className="glass-card rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Incident Details</h2>
          <Badge variant="outline" className="text-[10px]">Simulated — not saved</Badge>
        </div>
        <IncidentDetailsPanel
          incident={incident}
          regionLabel={congestionRegion.label}
          updating={false}
          onUpdateStatus={async (next) => {
            setStatus(next)
          }}
        />
      </div>
    </div>
  )
}
