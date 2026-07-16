import type { CopilotAction, CopilotInsightCardProps } from './schema'

export type EmergencyType = 'medical' | 'fire' | 'lost-child' | 'security'

export interface CrowdZoneInput {
  zone: string
  capacity: number
  count: number
  max: number
  status: 'normal' | 'warning' | 'critical'
}

export interface ParkingInput {
  lot: string
  total: number
  occupied: number
  status: 'full' | 'warning' | 'available'
  walkingMinutes: number
  gate: string
  trafficLevel: 'Low' | 'Moderate' | 'High'
}

export interface TournamentInput {
  time: string
  event: string
  status: 'completed' | 'active' | 'upcoming'
  venue: string
}

export interface WeatherInput {
  temp: number
  condition: string
  humidity: number
  wind: number
}

export interface SeatRecommendationInput {
  budget: 'value' | 'premium' | 'elite'
  groupSize: number
  accessibility: boolean
  vip: boolean
  coveredSeating: boolean
}

export interface ExecutiveInput {
  crowd: CrowdZoneInput[]
  parking: ParkingInput[]
  tournament: TournamentInput[]
  weather: WeatherInput
  emergencyType: EmergencyType
}

export interface AttendanceForecast {
  current: number
  projectedPeak: number
  nextWaveEtaMinutes: number
  peakWindow: string
  riskLevel: 'Low' | 'Moderate' | 'High'
}

export interface SystemRecommendationEvent {
  id: string
  module: 'crowd' | 'parking' | 'tournament' | 'emergency' | 'executive'
  severity: 'info' | 'warning' | 'critical'
  title: string
  prompt: string
  summary: string
}

export interface PlatformIntel {
  attendanceForecast: AttendanceForecast
  crowdInsight: CopilotInsightCardProps
  parkingInsight: CopilotInsightCardProps
  tournamentInsight: CopilotInsightCardProps
  emergencyInsight: CopilotInsightCardProps
  executiveInsight: CopilotInsightCardProps
  systemEvents: SystemRecommendationEvent[]
}

export interface SeatRecommendationCard {
  id: string
  section: string
  pricePerSeat: number
  fitScore: number
  distanceToAction: 'Trackside' | 'Lower Bowl' | 'Balanced' | 'Panoramic'
  covered: boolean
  vip: boolean
  accessible: boolean
  perks: string[]
  reason: string
}

function makeActions(actions: Array<[string, string, CopilotAction['variant']]>) {
  return actions.map(([label, action, variant]) => ({ label, action, variant }))
}

function insight(
  recommendation: string,
  prediction: string,
  reasoning: string,
  confidence: number,
  summary: string,
  suggestedActions: CopilotAction[],
): CopilotInsightCardProps {
  return {
    recommendation,
    prediction,
    reasoning,
    confidence,
    summary,
    suggestedActions,
    timestamp: new Date(),
  }
}

export function buildCrowdInsight(crowd: CrowdZoneInput[]): CopilotInsightCardProps {
  const busiest = [...crowd].sort((a, b) => b.capacity - a.capacity)[0]
  const averageLoad = Math.round(crowd.reduce((sum, zone) => sum + zone.capacity, 0) / crowd.length)
  const riskLevel = busiest.capacity >= 90 ? 'High' : busiest.capacity >= 75 ? 'Moderate' : 'Low'

  return insight(
    `Redistribute arrivals away from ${busiest.zone} for the next 18 minutes.`,
    `${busiest.zone} is projected to peak at ${Math.min(99, busiest.capacity + 4)}% occupancy during the next ingress wave.`,
    `${busiest.zone} is already operating at ${busiest.capacity}% capacity while the venue average is ${averageLoad}%. Similar attendance curves show a secondary surge within 15-20 minutes after the current checkpoint pattern, raising the ${riskLevel.toLowerCase()} risk threshold unless gates are rebalanced.`,
    busiest.capacity >= 90 ? 93 : 86,
    `- Risk Level: ${riskLevel}\n- Peak Window: 18:10-18:40\n- Busiest Zone: ${busiest.zone}\n- Venue Average Load: ${averageLoad}%`,
    makeActions([
      ['Reroute Fans', 'reroute-fans', 'primary'],
      ['Open Overflow Gate', 'open-overflow-gate', 'secondary'],
      ['Notify Field Ops', 'notify-field-ops', 'ghost'],
    ]),
  )
}

export function deriveAttendanceForecast(crowd: CrowdZoneInput[]): AttendanceForecast {
  const current = crowd.reduce((sum, zone) => sum + zone.count, 0)
  const capacityAverage = Math.round(crowd.reduce((sum, zone) => sum + zone.capacity, 0) / crowd.length)
  const projectedPeak = Math.round(current * (capacityAverage >= 85 ? 1.07 : capacityAverage >= 70 ? 1.05 : 1.03))
  const nextWaveEtaMinutes = capacityAverage >= 85 ? 12 : capacityAverage >= 70 ? 18 : 24
  const riskLevel = capacityAverage >= 85 ? 'High' : capacityAverage >= 70 ? 'Moderate' : 'Low'
  const peakWindow = riskLevel === 'High' ? '18:05-18:30' : riskLevel === 'Moderate' ? '18:20-18:45' : '18:35-19:00'

  return {
    current,
    projectedPeak,
    nextWaveEtaMinutes,
    peakWindow,
    riskLevel,
  }
}

export function buildParkingInsight(parking: ParkingInput[]): CopilotInsightCardProps {
  const bestLot = [...parking]
    .filter((lot) => lot.status !== 'full')
    .sort((a, b) => {
      const aScore = a.walkingMinutes + (a.trafficLevel === 'High' ? 6 : a.trafficLevel === 'Moderate' ? 3 : 0)
      const bScore = b.walkingMinutes + (b.trafficLevel === 'High' ? 6 : b.trafficLevel === 'Moderate' ? 3 : 0)
      return aScore - bScore
    })[0]

  const openSpots = parking.reduce((sum, lot) => sum + (lot.total - lot.occupied), 0)

  return insight(
    `Route incoming vehicles to ${bestLot.lot} and use ${bestLot.gate} as the default pedestrian entry.`,
    `${bestLot.lot} should retain ${Math.max(40, bestLot.total - bestLot.occupied - 80)} open spaces through the next arrival cycle.`,
    `${bestLot.lot} combines the lowest walking distance at ${bestLot.walkingMinutes} minutes with ${bestLot.trafficLevel.toLowerCase()} traffic pressure. Across the network there are ${openSpots.toLocaleString()} remaining spaces, so consolidating on the cleanest corridor reduces queue time without overloading the gate mix.`,
    91,
    `- Suggested Lot: ${bestLot.lot}\n- Suggested Gate: ${bestLot.gate}\n- Traffic Level: ${bestLot.trafficLevel}\n- Network Availability: ${openSpots.toLocaleString()} spaces`,
    makeActions([
      ['Push Navigation Update', 'push-navigation-update', 'primary'],
      ['Reserve Overflow Buffer', 'reserve-overflow-buffer', 'secondary'],
      ['Share to Signage', 'share-to-signage', 'ghost'],
    ]),
  )
}

export function buildIntegratedParkingInsight(
  parking: ParkingInput[],
  crowd: CrowdZoneInput[],
  attendance: AttendanceForecast,
): CopilotInsightCardProps {
  const base = buildParkingInsight(parking)
  const crowdInsight = buildCrowdInsight(crowd)
  const crowdZone = [...crowd].sort((a, b) => b.capacity - a.capacity)[0]

  return {
    ...base,
    recommendation: `${base.recommendation} Keep ${crowdZone.zone} arrivals away from ${base.suggestedActions[0]?.label === 'Push Navigation Update' ? crowdZone.zone : 'the busiest corridor'}.`,
    prediction: `${attendance.projectedPeak.toLocaleString()} attendees are expected before ${attendance.peakWindow}, so ${base.prediction?.toLowerCase()}`,
    reasoning: `${base.reasoning} This parking plan is linked to the crowd forecast: ${crowdZone.zone} remains the ingress pressure point, so parking guidance must shift arrivals toward gates that avoid reinforcing that zone.`,
    summary: `- Crowd Dependency: ${crowdInsight.recommendation}\n- Parking Action: ${base.recommendation}\n- Attendance Forecast: ${attendance.projectedPeak.toLocaleString()} peak attendees\n- Synchronization Window: ${attendance.peakWindow}`,
  }
}

export function buildTournamentInsight(tournament: TournamentInput[]): CopilotInsightCardProps {
  const activeMatch = tournament.find((match) => match.status === 'active') ?? tournament[0]
  const upcoming = tournament.filter((match) => match.status === 'upcoming').length

  return insight(
    `Hold the current rotation and stage the next officiating crew near ${activeMatch.venue}.`,
    `${upcoming} matches remain in the queue and the final is still on pace for its scheduled start.`,
    `${activeMatch.event} is the current pacing anchor for the bracket. Because the next changeover window is tight, pre-positioning officials and broadcast support at ${activeMatch.venue} reduces the most likely delay point without affecting completed fixtures.`,
    88,
    `- Active Match: ${activeMatch.event}\n- Venue: ${activeMatch.venue}\n- Remaining Matches: ${upcoming}\n- Timeline Status: On schedule`,
    makeActions([
      ['Stage Officials', 'stage-officials', 'primary'],
      ['Sync Broadcast Crew', 'sync-broadcast-crew', 'secondary'],
      ['Export Match Timeline', 'export-match-timeline', 'ghost'],
    ]),
  )
}

export function buildIntegratedTournamentInsight(
  tournament: TournamentInput[],
  attendance: AttendanceForecast,
): CopilotInsightCardProps {
  const base = buildTournamentInsight(tournament)
  const activeMatch = tournament.find((match) => match.status === 'active') ?? tournament[0]

  return {
    ...base,
    recommendation: `${base.recommendation} Prepare concourse and staffing transitions for a projected attendance peak of ${attendance.projectedPeak.toLocaleString()}.`,
    prediction: `Attendance is likely to crest near ${attendance.projectedPeak.toLocaleString()} during ${attendance.peakWindow}, overlapping with ${activeMatch.event}.`,
    reasoning: `${base.reasoning} The tournament schedule now depends on attendance load because the next ingress wave lands in ${attendance.nextWaveEtaMinutes} minutes. Match changeovers and broadcast staging should avoid competing with the highest concourse demand window.`,
    summary: `- Active Match: ${activeMatch.event}\n- Attendance Overlay: ${attendance.projectedPeak.toLocaleString()} projected peak\n- Peak Window: ${attendance.peakWindow}\n- Scheduling Impact: Protect changeovers during fan surge`,
  }
}

export function buildEmergencyInsight(type: EmergencyType): CopilotInsightCardProps {
  const map: Record<EmergencyType, CopilotInsightCardProps> = {
    medical: insight(
      'Dispatch the closest medic team and clear a protected ingress lane immediately.',
      'Patient contact should occur within 3 minutes if the south concourse stays open.',
      'Medical incidents are most sensitive to access delay and crowd compression. A clear lane plus a designated scene lead reduces treatment start time and avoids secondary congestion around responders.',
      96,
      '- Incident Type: Medical\n- Lead Team: Medical Unit Alpha\n- Escalation Window: 3 minutes\n- Broadcast Need: Localized only',
      makeActions([
        ['Dispatch Medics', 'dispatch-medics', 'primary'],
        ['Open Access Lane', 'open-access-lane', 'secondary'],
        ['Notify Command Center', 'notify-command-center', 'ghost'],
      ]),
    ),
    fire: insight(
      'Isolate the affected zone, stop fan inflow, and stage evacuation marshals on both adjacent aisles.',
      'Containment remains high if isolation starts before the next two-minute crowd wave.',
      'Fire response effectiveness depends on perimeter control more than raw alarm speed. Halting ingress and controlling aisle movement reduces smoke exposure and prevents evacuation routes from collapsing under reverse flow.',
      94,
      '- Incident Type: Fire\n- Lead Team: Fire Response Delta\n- Isolation Radius: 2 sections\n- Broadcast Need: Section-specific instructions',
      makeActions([
        ['Lock Adjacent Gates', 'lock-adjacent-gates', 'primary'],
        ['Deploy Marshals', 'deploy-marshals', 'secondary'],
        ['Trigger PA Script', 'trigger-pa-script', 'ghost'],
      ]),
    ),
    'lost-child': insight(
      'Switch to a soft perimeter search and route guardians to the reunification desk without broadcasting identity details.',
      'Recovery probability exceeds 90% within 12 minutes if concourse cameras and gate staff are aligned now.',
      'Lost-child cases resolve fastest when the search area is narrowed quietly and guardians are anchored to a fixed reunification point. Broad public announcements often increase movement and reduce the signal from staff sightings.',
      92,
      '- Incident Type: Lost Child\n- Lead Team: Guest Services Blue\n- Search Pattern: Soft perimeter\n- Broadcast Need: Internal only',
      makeActions([
        ['Activate Camera Sweep', 'activate-camera-sweep', 'primary'],
        ['Alert Gate Staff', 'alert-gate-staff', 'secondary'],
        ['Open Reunification Desk', 'open-reunification-desk', 'ghost'],
      ]),
    ),
    security: insight(
      'Contain the section with visible staff presence and start an evidence-preserving intervention log.',
      'The incident should remain localized if staff density is increased before nearby concessions release their queue.',
      'Security issues typically expand when bystander attention outpaces staff presence. Visible containment with disciplined logging deters escalation and preserves the handoff path for supervisors or law enforcement.',
      90,
      '- Incident Type: Security\n- Lead Team: Security Bravo\n- Containment Radius: 1 section\n- Broadcast Need: None unless escalated',
      makeActions([
        ['Deploy Security Bravo', 'deploy-security-bravo', 'primary'],
        ['Freeze Nearby Queue', 'freeze-nearby-queue', 'secondary'],
        ['Start Incident Log', 'start-incident-log', 'ghost'],
      ]),
    ),
  }

  return map[type]
}

export function buildIntegratedEmergencyInsight(
  type: EmergencyType,
  crowd: CrowdZoneInput[],
  attendance: AttendanceForecast,
): CopilotInsightCardProps {
  const base = buildEmergencyInsight(type)
  const crowdZone = [...crowd].sort((a, b) => b.capacity - a.capacity)[0]

  return {
    ...base,
    prediction: `${base.prediction} Crowd conditions indicate the highest exposure remains around ${crowdZone.zone} before ${attendance.peakWindow}.`,
    reasoning: `${base.reasoning} Current crowd density around ${crowdZone.zone} means any ${type.replace('-', ' ')} response must account for a projected attendance peak of ${attendance.projectedPeak.toLocaleString()} and preserve at least one clean responder corridor before the next surge.`,
    summary: `- Incident Type: ${type}\n- Crowd Alert Zone: ${crowdZone.zone}\n- Attendance Peak: ${attendance.projectedPeak.toLocaleString()}\n- Operational Priority: Keep emergency path clear before ${attendance.peakWindow}`,
  }
}

export function buildExecutiveInsight(input: ExecutiveInput): CopilotInsightCardProps {
  const crowd = buildCrowdInsight(input.crowd)
  const parking = buildParkingInsight(input.parking)
  const tournament = buildTournamentInsight(input.tournament)
  const emergency = buildEmergencyInsight(input.emergencyType)

  return insight(
    `Prioritize crowd balancing and parking routing while keeping ${input.emergencyType.replace('-', ' ')} protocols in standby.`,
    `${input.weather.condition} conditions should keep tournament timing stable, with the main risk concentrated in ingress density rather than weather disruption.`,
    `Crowd pressure is the current operational constraint, while parking still has enough distributed capacity to smooth arrivals if guidance is pushed quickly. Weather is stable at ${input.weather.temp}°C with ${input.weather.wind} km/h winds, so command attention can stay on movement control and scenario readiness instead of full-site weather mitigation.`,
    89,
    `- Crowd: ${crowd.recommendation}\n- Parking: ${parking.recommendation}\n- Weather: ${input.weather.condition}, ${input.weather.temp}°C\n- Emergency: ${emergency.recommendation}\n- Tournament: ${tournament.prediction}`,
    makeActions([
      ['Publish Executive Brief', 'publish-executive-brief', 'primary'],
      ['Sync Department Leads', 'sync-department-leads', 'secondary'],
      ['Archive Snapshot', 'archive-snapshot', 'ghost'],
    ]),
  )
}

export function buildIntegratedExecutiveInsight(
  input: ExecutiveInput,
  attendance: AttendanceForecast,
  crowdInsight: CopilotInsightCardProps,
  parkingInsight: CopilotInsightCardProps,
  tournamentInsight: CopilotInsightCardProps,
  emergencyInsight: CopilotInsightCardProps,
): CopilotInsightCardProps {
  const base = buildExecutiveInsight(input)

  return {
    ...base,
    recommendation: `Operate ATHLIX as a synchronized ingress-control platform: crowd routing first, parking guidance second, tournament pacing third, with ${input.emergencyType.replace('-', ' ')} readiness held live.`,
    prediction: `${attendance.projectedPeak.toLocaleString()} attendees are expected by ${attendance.peakWindow}; synchronized crowd, parking, and tournament adjustments should keep venue risk at ${attendance.riskLevel.toLowerCase()}-${attendance.riskLevel === 'High' ? 'plus' : 'stable'} levels.`,
    reasoning: `${base.reasoning} The key platform dependency is that crowd pressure sets the constraint, parking absorbs the reroute, tournament timing avoids the surge, and emergency readiness protects the busiest zone. Each recommendation is therefore chained rather than independent.`,
    summary: `- Crowd: ${crowdInsight.recommendation}\n- Parking: ${parkingInsight.recommendation}\n- Tournament: ${tournamentInsight.recommendation}\n- Emergency: ${emergencyInsight.recommendation}\n- Attendance Forecast: ${attendance.projectedPeak.toLocaleString()} by ${attendance.peakWindow}`,
  }
}

export function derivePlatformIntel(input: ExecutiveInput): PlatformIntel {
  const attendanceForecast = deriveAttendanceForecast(input.crowd)
  const crowdInsight = buildCrowdInsight(input.crowd)
  const parkingInsight = buildIntegratedParkingInsight(input.parking, input.crowd, attendanceForecast)
  const tournamentInsight = buildIntegratedTournamentInsight(input.tournament, attendanceForecast)
  const emergencyInsight = buildIntegratedEmergencyInsight(
    input.emergencyType,
    input.crowd,
    attendanceForecast,
  )
  const executiveInsight = buildIntegratedExecutiveInsight(
    input,
    attendanceForecast,
    crowdInsight,
    parkingInsight,
    tournamentInsight,
    emergencyInsight,
  )

  const crowdZone = [...input.crowd].sort((a, b) => b.capacity - a.capacity)[0]

  return {
    attendanceForecast,
    crowdInsight,
    parkingInsight,
    tournamentInsight,
    emergencyInsight,
    executiveInsight,
    systemEvents: [
      {
        id: `crowd-${crowdZone.zone}`,
        module: 'crowd',
        severity: attendanceForecast.riskLevel === 'High' ? 'critical' : 'warning',
        title: 'Crowd prediction escalated',
        prompt: `Crowd intelligence predicts ${crowdZone.zone} will peak at ${Math.min(99, crowdZone.capacity + 4)}%. Coordinate parking, tournament, and emergency readiness now.`,
        summary: `${crowdZone.zone} is the live constraint and should lead all downstream decisions.`,
      },
      {
        id: `parking-${input.parking[0]?.lot ?? 'default'}`,
        module: 'parking',
        severity: 'warning',
        title: 'Parking routing updated from crowd model',
        prompt: `Use the latest crowd forecast to refresh parking and gate guidance for the next arrival wave.`,
        summary: 'Ingress routing has been recalibrated to reduce pressure on the busiest fan corridor.',
      },
      {
        id: `tournament-${input.tournament[3]?.time ?? 'active'}`,
        module: 'tournament',
        severity: 'info',
        title: 'Attendance forecast applied to tournament schedule',
        prompt: `Adjust the tournament timeline using the projected attendance peak of ${attendanceForecast.projectedPeak.toLocaleString()}.`,
        summary: 'Changeovers and crew staging should avoid the main attendance surge.',
      },
      {
        id: `emergency-${input.emergencyType}`,
        module: 'emergency',
        severity: attendanceForecast.riskLevel === 'High' ? 'critical' : 'warning',
        title: 'Emergency readiness synchronized with crowd alert',
        prompt: `Update ${input.emergencyType.replace('-', ' ')} response planning using the latest crowd alert around ${crowdZone.zone}.`,
        summary: 'Responder paths now depend on the same crowd model driving ingress decisions.',
      },
    ],
  }
}

export function generateSeatRecommendations(input: SeatRecommendationInput): SeatRecommendationCard[] {
  const inventory: SeatRecommendationCard[] = [
    {
      id: 'club-108',
      section: 'Club 108',
      pricePerSeat: 185,
      fitScore: 0,
      distanceToAction: 'Lower Bowl',
      covered: true,
      vip: true,
      accessible: true,
      perks: ['Private lounge access', 'Premium food service', 'Fast-track entry'],
      reason: 'Best for executive hosting with weather protection and direct hospitality access.',
    },
    {
      id: 'west-214',
      section: 'West 214',
      pricePerSeat: 92,
      fitScore: 0,
      distanceToAction: 'Balanced',
      covered: true,
      vip: false,
      accessible: true,
      perks: ['Balanced sightlines', 'Near elevators', 'Family-friendly section'],
      reason: 'Ideal mid-budget option with strong accessibility and protected sightlines.',
    },
    {
      id: 'east-122',
      section: 'East 122',
      pricePerSeat: 118,
      fitScore: 0,
      distanceToAction: 'Lower Bowl',
      covered: false,
      vip: false,
      accessible: false,
      perks: ['Closest to player tunnel', 'Fast concession access', 'High-energy supporter zone'],
      reason: 'Best for small groups prioritizing atmosphere and direct field proximity.',
    },
    {
      id: 'sky-401',
      section: 'Sky Deck 401',
      pricePerSeat: 68,
      fitScore: 0,
      distanceToAction: 'Panoramic',
      covered: true,
      vip: false,
      accessible: true,
      perks: ['Best venue overview', 'Shaded seating', 'Quick upper-concourse access'],
      reason: 'Strong value option for larger groups that want easy movement and weather cover.',
    },
    {
      id: 'vip-suites',
      section: 'North VIP Suite',
      pricePerSeat: 260,
      fitScore: 0,
      distanceToAction: 'Trackside',
      covered: true,
      vip: true,
      accessible: true,
      perks: ['Private host', 'Suite dining', 'Dedicated parking'],
      reason: 'Highest-comfort package with privacy, premium service, and shortest arrival path.',
    },
  ]

  const budgetCap = input.budget === 'value' ? 90 : input.budget === 'premium' ? 160 : 280

  return inventory
    .map((seat) => {
      let score = 60
      if (seat.pricePerSeat <= budgetCap) score += 18
      else score -= Math.min(20, Math.round((seat.pricePerSeat - budgetCap) / 8))
      if (input.groupSize >= 4 && seat.distanceToAction !== 'Trackside') score += 8
      if (input.groupSize <= 2 && seat.distanceToAction === 'Trackside') score += 8
      if (input.accessibility && seat.accessible) score += 14
      if (input.accessibility && !seat.accessible) score -= 18
      if (input.vip && seat.vip) score += 14
      if (!input.vip && seat.vip) score -= 4
      if (input.coveredSeating && seat.covered) score += 10
      if (input.coveredSeating && !seat.covered) score -= 10

      return {
        ...seat,
        fitScore: Math.max(52, Math.min(98, score)),
      }
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 3)
}

export function generateCopilotResponse(
  prompt: string,
  context: ExecutiveInput,
  seatInput: SeatRecommendationInput,
): CopilotInsightCardProps {
  const normalized = prompt.toLowerCase()

  if (normalized.includes('seat') || normalized.includes('vip') || normalized.includes('budget')) {
    const topSeat = generateSeatRecommendations(seatInput)[0]

    return insight(
      `Recommend ${topSeat.section} for the strongest fan-to-budget fit.`,
      `${topSeat.section} should remain the best-value premium block until the next pricing refresh.`,
      `${topSeat.section} matches the current preference mix across budget, group composition, and comfort flags. Its fit score of ${topSeat.fitScore}% is driven by ${topSeat.covered ? 'weather protection' : 'strong field proximity'}, ${topSeat.vip ? 'premium hospitality' : 'balanced access'}, and operationally clean ingress.`,
      87,
      `## Seat Summary\n- Section: ${topSeat.section}\n- Price: $${topSeat.pricePerSeat} per seat\n- Fit Score: ${topSeat.fitScore}%\n- Key Perks: ${topSeat.perks.join(', ')}`,
      makeActions([
        ['Reserve Section', 'reserve-section', 'primary'],
        ['Compare Alternatives', 'compare-alternatives', 'secondary'],
        ['Share Recommendation', 'share-recommendation', 'ghost'],
      ]),
    )
  }

  if (normalized.includes('parking') || normalized.includes('gate') || normalized.includes('traffic')) {
    return buildParkingInsight(context.parking)
  }

  if (normalized.includes('crowd') || normalized.includes('heatmap') || normalized.includes('zone')) {
    return buildCrowdInsight(context.crowd)
  }

  if (normalized.includes('medical') || normalized.includes('injury')) {
    return buildEmergencyInsight('medical')
  }

  if (normalized.includes('fire') || normalized.includes('smoke')) {
    return buildEmergencyInsight('fire')
  }

  if (normalized.includes('lost child') || normalized.includes('missing child')) {
    return buildEmergencyInsight('lost-child')
  }

  if (normalized.includes('security') || normalized.includes('incident')) {
    return buildEmergencyInsight('security')
  }

  if (normalized.includes('tournament') || normalized.includes('fixture') || normalized.includes('bracket')) {
    return buildTournamentInsight(context.tournament)
  }

  return buildExecutiveInsight(context)
}
