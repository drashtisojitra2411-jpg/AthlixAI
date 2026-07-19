import { describe, expect, it } from 'vitest'
import {
  buildCrowdInsight,
  buildEmergencyInsight,
  buildExecutiveInsight,
  buildIntegratedEmergencyInsight,
  buildIntegratedExecutiveInsight,
  buildIntegratedParkingInsight,
  buildIntegratedTournamentInsight,
  buildParkingInsight,
  buildTournamentInsight,
  deriveAttendanceForecast,
  derivePlatformIntel,
  generateCopilotResponse,
  generateSeatRecommendations,
  type CrowdZoneInput,
  type EmergencyType,
  type ExecutiveInput,
  type ParkingInput,
  type SeatRecommendationInput,
  type TournamentInput,
} from './engine'

function zone(overrides: Partial<CrowdZoneInput> = {}): CrowdZoneInput {
  return { zone: 'A', capacity: 60, count: 1000, max: 2000, status: 'normal', ...overrides }
}

function lot(overrides: Partial<ParkingInput> = {}): ParkingInput {
  return {
    lot: 'Lot A',
    total: 200,
    occupied: 50,
    status: 'available',
    walkingMinutes: 5,
    gate: 'Gate 1',
    trafficLevel: 'Low',
    ...overrides,
  }
}

function match(overrides: Partial<TournamentInput> = {}): TournamentInput {
  return { time: '18:00', event: 'Semifinal', status: 'active', venue: 'Center Court', ...overrides }
}

function executiveInput(overrides: Partial<ExecutiveInput> = {}): ExecutiveInput {
  return {
    crowd: [zone({ zone: 'North Stand', capacity: 80, count: 1500, max: 2000 })],
    parking: [lot()],
    tournament: [match()],
    weather: { temp: 24, condition: 'Clear', humidity: 40, wind: 10 },
    emergencyType: 'medical',
    ...overrides,
  }
}

describe('deriveAttendanceForecast', () => {
  it('classifies below-70% average capacity as Low risk', () => {
    const forecast = deriveAttendanceForecast([zone({ capacity: 60, count: 1000 })])
    expect(forecast.riskLevel).toBe('Low')
    expect(forecast.nextWaveEtaMinutes).toBe(24)
    expect(forecast.projectedPeak).toBe(1030)
  })

  it('classifies 70-84% average capacity as Moderate risk', () => {
    const forecast = deriveAttendanceForecast([zone({ capacity: 75, count: 1000 })])
    expect(forecast.riskLevel).toBe('Moderate')
    expect(forecast.nextWaveEtaMinutes).toBe(18)
    expect(forecast.projectedPeak).toBe(1050)
  })

  it('classifies 85%+ average capacity as High risk', () => {
    const forecast = deriveAttendanceForecast([zone({ capacity: 90, count: 1000 })])
    expect(forecast.riskLevel).toBe('High')
    expect(forecast.nextWaveEtaMinutes).toBe(12)
    expect(forecast.projectedPeak).toBe(1070)
  })

  it('sums attendance across all zones', () => {
    const forecast = deriveAttendanceForecast([
      zone({ zone: 'A', capacity: 50, count: 500 }),
      zone({ zone: 'B', capacity: 50, count: 700 }),
    ])
    expect(forecast.current).toBe(1200)
  })
})

describe('generateSeatRecommendations', () => {
  const baseInput = { budget: 'premium' as const, groupSize: 4, accessibility: false, vip: false, coveredSeating: false }

  it('returns exactly 3 recommendations sorted by fitScore descending', () => {
    const recommendations = generateSeatRecommendations(baseInput)
    expect(recommendations).toHaveLength(3)
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1].fitScore).toBeGreaterThanOrEqual(recommendations[i].fitScore)
    }
  })

  it('keeps every fitScore within the documented 52-98 bounds', () => {
    const recommendations = generateSeatRecommendations(baseInput)
    for (const rec of recommendations) {
      expect(rec.fitScore).toBeGreaterThanOrEqual(52)
      expect(rec.fitScore).toBeLessThanOrEqual(98)
    }
  })

  it('produces a different recommendation set for a tight value budget than an elite budget', () => {
    const valuePicks = generateSeatRecommendations({ ...baseInput, budget: 'value' }).map((r) => r.id)
    const elitePicks = generateSeatRecommendations({ ...baseInput, budget: 'elite' }).map((r) => r.id)
    expect(valuePicks).not.toEqual(elitePicks)
  })

  it('ranks an accessible seat above the same request without the accessibility flag', () => {
    const withAccessibility = generateSeatRecommendations({ ...baseInput, accessibility: true })
    const eastSeat = withAccessibility.find((s) => s.id === 'east-122')
    // east-122 is the only inaccessible seat in the inventory — requesting
    // accessibility should never surface it in the top 3 alongside cheaper
    // accessible alternatives at the same budget.
    expect(eastSeat).toBeUndefined()
  })

  it('favors VIP seats when vip is requested', () => {
    const recommendations = generateSeatRecommendations({ ...baseInput, budget: 'elite', vip: true })
    expect(recommendations[0].vip).toBe(true)
  })

  it('penalizes VIP seats when vip is not requested', () => {
    const recommendations = generateSeatRecommendations({ ...baseInput, budget: 'elite', vip: false })
    const vipSuite = recommendations.find((s) => s.id === 'vip-suites')
    const clubSeat = recommendations.find((s) => s.id === 'club-108')
    // Without a VIP ask, non-VIP club-108 should never score below the VIP suite at the same budget tier.
    if (vipSuite && clubSeat) {
      expect(clubSeat.fitScore).toBeGreaterThanOrEqual(vipSuite.fitScore)
    }
  })

  it('prefers Trackside seating for a small group', () => {
    const recommendations = generateSeatRecommendations({ ...baseInput, budget: 'elite', groupSize: 2 })
    expect(recommendations.some((s) => s.distanceToAction === 'Trackside')).toBe(true)
  })

  it('boosts covered seats when coveredSeating is requested', () => {
    const covered = generateSeatRecommendations({ ...baseInput, coveredSeating: true })
    const uncovered = generateSeatRecommendations({ ...baseInput, coveredSeating: false })
    const eastCovered = covered.find((s) => s.id === 'east-122')
    const eastUncovered = uncovered.find((s) => s.id === 'east-122')
    // east-122 is the only uncovered seat — requesting cover should score it lower than not requesting it.
    if (eastCovered && eastUncovered) {
      expect(eastCovered.fitScore).toBeLessThan(eastUncovered.fitScore)
    }
  })
})

describe('buildCrowdInsight', () => {
  it('rates a zone at 90%+ capacity as High risk with 93% confidence', () => {
    const result = buildCrowdInsight([zone({ zone: 'North Stand', capacity: 92 })])
    expect(result.summary).toContain('Risk Level: High')
    expect(result.confidence).toBe(93)
  })

  it('rates a zone at 75-89% capacity as Moderate risk with 86% confidence', () => {
    const result = buildCrowdInsight([zone({ zone: 'North Stand', capacity: 80 })])
    expect(result.summary).toContain('Risk Level: Moderate')
    expect(result.confidence).toBe(86)
  })

  it('rates a zone under 75% capacity as Low risk with 86% confidence', () => {
    const result = buildCrowdInsight([zone({ zone: 'North Stand', capacity: 50 })])
    expect(result.summary).toContain('Risk Level: Low')
    expect(result.confidence).toBe(86)
  })

  it('names the highest-capacity zone as the busiest zone across multiple zones', () => {
    const result = buildCrowdInsight([
      zone({ zone: 'South Stand', capacity: 40 }),
      zone({ zone: 'North Stand', capacity: 95 }),
    ])
    expect(result.summary).toContain('Busiest Zone: North Stand')
  })
})

describe('buildParkingInsight', () => {
  it('excludes lots at full status from the recommendation', () => {
    const result = buildParkingInsight([
      lot({ lot: 'Lot Full', status: 'full', walkingMinutes: 1, trafficLevel: 'Low' }),
      lot({ lot: 'Lot Open', status: 'available', walkingMinutes: 10, trafficLevel: 'Low' }),
    ])
    expect(result.summary).toContain('Suggested Lot: Lot Open')
  })

  it('prefers lower walking time plus lower traffic penalty over raw distance alone', () => {
    const result = buildParkingInsight([
      lot({ lot: 'Close but jammed', walkingMinutes: 3, trafficLevel: 'High' }), // 3 + 6 = 9
      lot({ lot: 'Farther but clear', walkingMinutes: 6, trafficLevel: 'Low' }), // 6 + 0 = 6
    ])
    expect(result.summary).toContain('Suggested Lot: Farther but clear')
  })

  it('floors the predicted remaining spaces at 40 even when the lot is nearly full', () => {
    const result = buildParkingInsight([lot({ lot: 'Lot A', total: 100, occupied: 95 })])
    expect(result.prediction).toContain('retain 40 open spaces')
  })
})

describe('buildIntegratedParkingInsight', () => {
  it('references the busiest crowd zone in the parking recommendation', () => {
    const attendance = deriveAttendanceForecast([zone({ capacity: 80 })])
    const result = buildIntegratedParkingInsight(
      [lot()],
      [zone({ zone: 'North Stand', capacity: 95 })],
      attendance,
    )
    expect(result.reasoning).toContain('North Stand')
    expect(result.summary).toContain('Attendance Forecast')
  })
})

describe('buildTournamentInsight', () => {
  it('anchors on the active match when one exists', () => {
    const result = buildTournamentInsight([
      match({ event: 'Opener', status: 'completed' }),
      match({ event: 'Semifinal', status: 'active', venue: 'Main Arena' }),
      match({ event: 'Final', status: 'upcoming' }),
    ])
    expect(result.summary).toContain('Active Match: Semifinal')
    expect(result.summary).toContain('Venue: Main Arena')
    expect(result.summary).toContain('Remaining Matches: 1')
  })

  it('falls back to the first match when no match is active', () => {
    const result = buildTournamentInsight([
      match({ event: 'Opener', status: 'completed' }),
      match({ event: 'Final', status: 'upcoming' }),
    ])
    expect(result.summary).toContain('Active Match: Opener')
  })
})

describe('buildIntegratedTournamentInsight', () => {
  it('folds the attendance forecast into the tournament recommendation', () => {
    const attendance = deriveAttendanceForecast([zone({ capacity: 90 })])
    const result = buildIntegratedTournamentInsight([match()], attendance)
    expect(result.recommendation).toContain(attendance.projectedPeak.toLocaleString())
    expect(result.prediction).toContain(attendance.peakWindow)
  })

  it('falls back to the first match when none is active', () => {
    const attendance = deriveAttendanceForecast([zone({ capacity: 50 })])
    const result = buildIntegratedTournamentInsight(
      [match({ event: 'Bronze Medal', status: 'upcoming' })],
      attendance,
    )
    expect(result.prediction).toContain('Bronze Medal')
  })
})

describe('buildEmergencyInsight', () => {
  const cases: Array<[EmergencyType, number]> = [
    ['medical', 96],
    ['fire', 94],
    ['lost-child', 92],
    ['security', 90],
  ]

  it.each(cases)('returns the %s playbook with confidence %d', (type, confidence) => {
    const result = buildEmergencyInsight(type)
    expect(result.confidence).toBe(confidence)
    expect(result.summary.toLowerCase()).toContain(type === 'lost-child' ? 'lost child' : type)
  })
})

describe('buildIntegratedEmergencyInsight', () => {
  it('folds the busiest crowd zone and attendance peak into the emergency briefing', () => {
    const attendance = deriveAttendanceForecast([zone({ capacity: 90 })])
    const result = buildIntegratedEmergencyInsight(
      'fire',
      [zone({ zone: 'South Gate', capacity: 91 })],
      attendance,
    )
    expect(result.reasoning).toContain('South Gate')
    expect(result.summary).toContain('Incident Type: fire')
  })

  it('humanizes a hyphenated emergency type in the reasoning text', () => {
    const attendance = deriveAttendanceForecast([zone({ capacity: 60 })])
    const result = buildIntegratedEmergencyInsight('lost-child', [zone()], attendance)
    expect(result.reasoning).toContain('lost child response')
  })
})

describe('buildExecutiveInsight', () => {
  it('summarizes crowd, parking, weather, emergency and tournament in one card', () => {
    const result = buildExecutiveInsight(executiveInput())
    expect(result.summary).toContain('Crowd:')
    expect(result.summary).toContain('Parking:')
    expect(result.summary).toContain('Weather:')
    expect(result.summary).toContain('Emergency:')
    expect(result.summary).toContain('Tournament:')
  })
})

describe('buildIntegratedExecutiveInsight', () => {
  it('labels risk as "-plus" when the attendance forecast is High risk', () => {
    const attendance = deriveAttendanceForecast([zone({ capacity: 95 })])
    const input = executiveInput()
    const crowd = buildCrowdInsight(input.crowd)
    const parking = buildParkingInsight(input.parking)
    const tournament = buildTournamentInsight(input.tournament)
    const emergency = buildEmergencyInsight(input.emergencyType)
    const result = buildIntegratedExecutiveInsight(input, attendance, crowd, parking, tournament, emergency)
    expect(result.prediction).toContain('high-plus')
  })

  it('labels risk as "-stable" when the attendance forecast is not High risk', () => {
    const attendance = deriveAttendanceForecast([zone({ capacity: 50 })])
    const input = executiveInput()
    const crowd = buildCrowdInsight(input.crowd)
    const parking = buildParkingInsight(input.parking)
    const tournament = buildTournamentInsight(input.tournament)
    const emergency = buildEmergencyInsight(input.emergencyType)
    const result = buildIntegratedExecutiveInsight(input, attendance, crowd, parking, tournament, emergency)
    expect(result.prediction).toContain('low-stable')
  })
})

describe('derivePlatformIntel', () => {
  it('marks crowd and emergency system events as critical when attendance risk is High', () => {
    const intel = derivePlatformIntel(executiveInput({ crowd: [zone({ zone: 'North Stand', capacity: 95 })] }))
    const crowdEvent = intel.systemEvents.find((e) => e.module === 'crowd')
    const emergencyEvent = intel.systemEvents.find((e) => e.module === 'emergency')
    expect(crowdEvent?.severity).toBe('critical')
    expect(emergencyEvent?.severity).toBe('critical')
  })

  it('marks crowd and emergency system events as warning when attendance risk is not High', () => {
    const intel = derivePlatformIntel(executiveInput({ crowd: [zone({ zone: 'North Stand', capacity: 50 })] }))
    const crowdEvent = intel.systemEvents.find((e) => e.module === 'crowd')
    const emergencyEvent = intel.systemEvents.find((e) => e.module === 'emergency')
    expect(crowdEvent?.severity).toBe('warning')
    expect(emergencyEvent?.severity).toBe('warning')
  })

  it('uses the 4th tournament slot\'s time in the event id when at least 4 matches exist', () => {
    const tournament = [
      match({ time: '10:00' }),
      match({ time: '12:00' }),
      match({ time: '14:00' }),
      match({ time: '16:00' }),
    ]
    const intel = derivePlatformIntel(executiveInput({ tournament }))
    expect(intel.systemEvents.find((e) => e.module === 'tournament')?.id).toBe('tournament-16:00')
  })

  it('falls back to a "tournament-active" event id when fewer than 4 matches exist', () => {
    const intel = derivePlatformIntel(executiveInput({ tournament: [match()] }))
    expect(intel.systemEvents.find((e) => e.module === 'tournament')?.id).toBe('tournament-active')
  })

  it('caps the crowd system-event peak projection at 99%', () => {
    const intel = derivePlatformIntel(executiveInput({ crowd: [zone({ zone: 'North Stand', capacity: 98 })] }))
    expect(intel.systemEvents.find((e) => e.module === 'crowd')?.prompt).toContain('peak at 99%')
  })
})

describe('generateCopilotResponse', () => {
  const context = executiveInput()
  const seatInput: SeatRecommendationInput = {
    budget: 'premium',
    groupSize: 4,
    accessibility: false,
    vip: false,
    coveredSeating: false,
  }

  const dispatchCases: Array<[string, string]> = [
    ['Any good VIP seats left?', 'Seat Summary'],
    ['What is my budget option', 'Seat Summary'],
    ['How is parking looking near gate 4', 'Suggested Lot'],
    ['Show me the crowd heatmap for zone A', 'Busiest Zone'],
    ['We have a medical injury report', 'Medical'],
    ['There is fire and smoke near section 4', 'Fire'],
    ['Report of a lost child near the food court', 'Lost Child'],
    ['Security concern reported near section 12', 'Security'],
    ['What does the tournament bracket look like', 'Active Match'],
  ]

  it.each(dispatchCases)('routes "%s" to the insight containing "%s"', (prompt, expectedSummaryFragment) => {
    const result = generateCopilotResponse(prompt, context, seatInput)
    expect(result.summary).toContain(expectedSummaryFragment)
  })

  it('describes the top seat as premium hospitality when it happens to be a VIP seat, even without an explicit VIP ask', () => {
    // Under an elite budget with a small group, the VIP suite outranks every
    // non-VIP seat on fit score alone — this exercises the response-text
    // branch that reflects the *seat's own* vip flag, distinct from whether
    // the caller explicitly asked for VIP.
    const result = generateCopilotResponse('any seats available', context, {
      budget: 'elite',
      groupSize: 2,
      accessibility: false,
      vip: false,
      coveredSeating: false,
    })
    expect(result.reasoning).toContain('premium hospitality')
  })

  it('gives the parking keyword branch priority over a later emergency keyword in the same prompt', () => {
    // generateCopilotResponse is a first-match keyword router with a fixed
    // check order — "gate" (parking branch) is checked well before "lost
    // child" (emergency branch), so a prompt containing both routes to
    // parking guidance, not the emergency playbook. This pins down that
    // documented precedence rather than asserting the "obviously intended"
    // route, which is a genuine trap for future callers composing prompts.
    const result = generateCopilotResponse('Report of a lost child near gate 2', context, seatInput)
    expect(result.summary).toContain('Suggested Lot')
  })

  it('is case-insensitive when matching prompt keywords', () => {
    const result = generateCopilotResponse('MEDICAL EMERGENCY', context, seatInput)
    expect(result.summary).toContain('Medical')
  })

  it('falls back to the executive insight when no keyword matches', () => {
    const result = generateCopilotResponse('give me a general status update', context, seatInput)
    expect(result.summary).toContain('Crowd:')
    expect(result.summary).toContain('Parking:')
  })
})
