import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CarFront,
  Crown,
  Flame,
  type LucideIcon,
  MapPinned,
  ShieldCheck,
  Siren,
  Sparkles,
  Ticket,
  Trophy,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  buildCrowdInsight,
  buildEmergencyInsight,
  buildExecutiveInsight,
  buildParkingInsight,
  buildTournamentInsight,
  derivePlatformIntel,
  generateSeatRecommendations,
  type CrowdZoneInput,
  type EmergencyType,
  type ExecutiveInput,
  type ParkingInput,
  type SeatRecommendationInput,
  type TournamentInput,
  type WeatherInput,
} from '@/lib/copilot/engine'
import { cn } from '@/lib/utils'
import { AICopilotPanel } from './AICopilotPanel'
import { StructuredAiCard } from './StructuredAiCard'

interface CrowdIntelligenceProps {
  crowd: CrowdZoneInput[]
}

interface SeatRecommendationProps {
  seatInput: SeatRecommendationInput
  onSeatInputChange: (next: SeatRecommendationInput) => void
}

interface TournamentSchedulerProps {
  tournament: TournamentInput[]
  onRegenerate: () => void
}

interface ParkingIntelligenceProps {
  parking: ParkingInput[]
}

interface EmergencyResponseProps {
  emergencyType: EmergencyType
  onEmergencyTypeChange: (next: EmergencyType) => void
}

interface ExecutiveSummaryProps {
  executiveInput: ExecutiveInput
}

const zonePositions = [
  { zone: 'North Stand', area: 'col-span-2 row-span-1' },
  { zone: 'South Stand', area: 'col-span-2 row-span-1' },
  { zone: 'East Wing', area: 'col-span-1 row-span-2' },
  { zone: 'West Wing', area: 'col-span-1 row-span-2' },
  { zone: 'VIP Section', area: 'col-span-2 row-span-1' },
]

export function CrowdIntelligenceModule({ crowd }: CrowdIntelligenceProps) {
  const insight = useMemo(() => buildCrowdInsight(crowd), [crowd])
  const busiest = useMemo(() => [...crowd].sort((a, b) => b.capacity - a.capacity)[0], [crowd])
  const peakHours = ['17:40', '18:10', '18:35', '19:05']
  const riskLevel = busiest.capacity >= 90 ? 'High' : busiest.capacity >= 75 ? 'Moderate' : 'Low'

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
              <Users className="size-5 text-accent" />
              Smart Crowd Intelligence
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              Predictive zone pressure, heatmap guidance, and ingress balancing recommendations.
            </p>
          </div>
          <Badge variant={riskLevel === 'High' ? 'error' : riskLevel === 'Moderate' ? 'warning' : 'success'}>
            Risk {riskLevel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">Venue Heatmap</h4>
                <p className="text-xs text-text-muted">AI-weighted occupancy grid with live zone labels</p>
              </div>
              <Badge variant="copilot">Live Sensor Blend</Badge>
            </div>

            <div className="grid h-[260px] grid-cols-4 grid-rows-4 gap-3">
              {zonePositions.map((position) => {
                const zone = crowd.find((item) => item.zone === position.zone)
                if (!zone) return null

                const tone =
                  zone.status === 'critical'
                    ? 'from-error/30 to-error/10 border-error/30'
                    : zone.status === 'warning'
                      ? 'from-warning/25 to-warning/10 border-warning/30'
                      : 'from-success/20 to-success/5 border-success/25'

                return (
                  <div
                    key={zone.zone}
                    className={cn(
                      'rounded-3xl border bg-gradient-to-br p-4',
                      position.area,
                      tone,
                    )}
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-text-muted">{zone.zone}</div>
                    <div className="mt-3 text-3xl font-bold tabular-nums text-text-primary">{zone.capacity}%</div>
                    <div className="mt-1 text-sm text-text-secondary">
                      {zone.count.toLocaleString()} / {zone.max.toLocaleString()}
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          zone.status === 'critical'
                            ? 'bg-error'
                            : zone.status === 'warning'
                              ? 'bg-warning'
                              : 'bg-success',
                        )}
                        style={{ width: `${zone.capacity}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Peak Hours</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {peakHours.map((time) => (
                    <Badge key={time} variant="outline">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Critical Zone</div>
                <div className="mt-2 text-lg font-semibold text-text-primary">{busiest.zone}</div>
                <div className="mt-1 text-sm text-text-muted">{busiest.capacity}% occupancy forecast</div>
              </div>
              <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Prediction Window</div>
                <div className="mt-2 text-lg font-semibold text-text-primary">Next 30 min</div>
                <div className="mt-1 text-sm text-text-muted">Ingress + concession crossover</div>
              </div>
            </div>

            <StructuredAiCard insight={insight} compact title="Crowd AI Recommendation" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SeatRecommendationModule({
  seatInput,
  onSeatInputChange,
}: SeatRecommendationProps) {
  const recommendations = useMemo(() => generateSeatRecommendations(seatInput), [seatInput])

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
              <Ticket className="size-5 text-accent" />
              Smart Seat Recommendation
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              Match premium inventory against budget, comfort, and accessibility preferences.
            </p>
          </div>
          <Badge variant="copilot">Premium Ranking Engine</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-5">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-text-muted">Budget</span>
            <select
              value={seatInput.budget}
              onChange={(event) =>
                onSeatInputChange({
                  ...seatInput,
                  budget: event.target.value as SeatRecommendationInput['budget'],
                })
              }
              className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-text-primary outline-none"
            >
              <option value="value">Value</option>
              <option value="premium">Premium</option>
              <option value="elite">Elite</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-text-muted">Group Size</span>
            <input
              type="number"
              min={1}
              max={12}
              value={seatInput.groupSize}
              onChange={(event) =>
                onSeatInputChange({
                  ...seatInput,
                  groupSize: Number(event.target.value) || 1,
                })
              }
              className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 text-sm text-text-primary outline-none"
            />
          </label>

          {[
            { key: 'accessibility', label: 'Accessibility' },
            { key: 'vip', label: 'VIP' },
            { key: 'coveredSeating', label: 'Covered Seating' },
          ].map((toggle) => (
            <label
              key={toggle.key}
              className="flex h-11 items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4"
            >
              <span className="text-sm text-text-secondary">{toggle.label}</span>
              <input
                type="checkbox"
                checked={seatInput[toggle.key as keyof SeatRecommendationInput] as boolean}
                onChange={(event) =>
                  onSeatInputChange({
                    ...seatInput,
                    [toggle.key]: event.target.checked,
                  })
                }
                className="size-4 accent-[var(--color-accent)]"
              />
            </label>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {recommendations.map((seat, index) => (
            <motion.div
              key={seat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Recommended Section</div>
                  <h4 className="mt-2 text-xl font-semibold text-text-primary">{seat.section}</h4>
                </div>
                <Badge variant={index === 0 ? 'copilot' : 'outline'}>{seat.fitScore}% fit</Badge>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Price</div>
                  <div className="mt-2 font-semibold text-text-primary">${seat.pricePerSeat}/seat</div>
                </div>
                <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">View Profile</div>
                  <div className="mt-2 font-semibold text-text-primary">{seat.distanceToAction}</div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-text-secondary">{seat.reason}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {seat.covered && <Badge variant="success">Covered</Badge>}
                {seat.vip && <Badge variant="copilot">VIP</Badge>}
                {seat.accessible && <Badge variant="info">Accessible</Badge>}
              </div>

              <div className="mt-4 space-y-2">
                {seat.perks.map((perk) => (
                  <div key={perk} className="flex items-start gap-2 text-sm text-text-muted">
                    <Crown className="mt-0.5 size-3.5 shrink-0 text-warning" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TournamentSchedulerModule({
  tournament,
  onRegenerate,
}: TournamentSchedulerProps) {
  const insight = useMemo(() => buildTournamentInsight(tournament), [tournament])
  const knockoutMatches = tournament.slice(-3)

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
              <Trophy className="size-5 text-accent" />
              Tournament Scheduler
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              Generate fixtures, knockout sequencing, and the live match timeline in one place.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onRegenerate}>
            Regenerate Fixtures
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.9fr]">
          <div className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-sm font-semibold text-text-primary">Fixtures</div>
            <div className="mt-4 space-y-3">
              {tournament.map((match) => (
                <div key={`${match.time}-${match.event}`} className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{match.event}</div>
                      <div className="mt-1 text-xs text-text-muted">{match.venue}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm tabular-nums text-text-primary">{match.time}</div>
                      <Badge
                        variant={
                          match.status === 'active'
                            ? 'copilot'
                            : match.status === 'completed'
                              ? 'success'
                              : 'outline'
                        }
                      >
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4">
            <div className="text-sm font-semibold text-text-primary">Knockout Bracket</div>
            <div className="mt-4 grid gap-4">
              {knockoutMatches.map((match, index) => (
                <div key={match.event} className="relative rounded-2xl bg-[rgba(255,255,255,0.03)] p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    {index < knockoutMatches.length - 1 ? `Semi-Final ${index + 1}` : 'Grand Final'}
                  </div>
                  <div className="mt-2 text-sm font-medium leading-relaxed text-text-primary">{match.event}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                    <span>{match.venue}</span>
                    <span>{match.time}</span>
                  </div>
                  {index < knockoutMatches.length - 1 && (
                    <div className="pointer-events-none absolute -bottom-4 left-1/2 h-4 w-px -translate-x-1/2 bg-[var(--color-border-default)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <StructuredAiCard insight={insight} compact title="Scheduling AI Summary" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ParkingIntelligenceModule({ parking }: ParkingIntelligenceProps) {
  const insight = useMemo(() => buildParkingInsight(parking), [parking])

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
              <CarFront className="size-5 text-accent" />
              Parking Intelligence
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              Balance availability, traffic pressure, walking time, and the best pedestrian gate.
            </p>
          </div>
          <Badge variant="copilot">Ingress Routing Active</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {parking.map((lot) => {
              const available = lot.total - lot.occupied
              return (
                <div
                  key={lot.lot}
                  className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{lot.lot}</div>
                      <div className="mt-2 text-2xl font-semibold tabular-nums text-text-primary">
                        {available}
                      </div>
                      <div className="text-sm text-text-muted">spaces available</div>
                    </div>
                    <Badge
                      variant={
                        lot.trafficLevel === 'High'
                          ? 'error'
                          : lot.trafficLevel === 'Moderate'
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {lot.trafficLevel}
                    </Badge>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Walk</div>
                      <div className="mt-2 font-semibold text-text-primary">{lot.walkingMinutes} min</div>
                    </div>
                    <div className="rounded-2xl bg-[rgba(255,255,255,0.03)] p-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">Gate</div>
                      <div className="mt-2 font-semibold text-text-primary">{lot.gate}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <StructuredAiCard insight={insight} compact title="Parking AI Recommendation" />
        </div>
      </CardContent>
    </Card>
  )
}

export function EmergencyResponseModule({
  emergencyType,
  onEmergencyTypeChange,
}: EmergencyResponseProps) {
  const insight = useMemo(() => buildEmergencyInsight(emergencyType), [emergencyType])

  const options: Array<{ value: EmergencyType; label: string; icon: LucideIcon }> = [
    { value: 'medical', label: 'Medical', icon: ShieldCheck },
    { value: 'fire', label: 'Fire', icon: Flame },
    { value: 'lost-child', label: 'Lost Child', icon: Users },
    { value: 'security', label: 'Security', icon: Siren },
  ]

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
              <Siren className="size-5 text-accent" />
              Emergency Response
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              AI-generated structured action plans for medical, fire, lost child, and security scenarios.
            </p>
          </div>
          <Badge variant="error">Response Mode</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-2 md:grid-cols-4">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onEmergencyTypeChange(option.value)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors',
                emergencyType === option.value
                  ? 'border-accent/40 bg-accent/10 text-text-primary'
                  : 'border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] text-text-muted hover:bg-[var(--color-surface-hover)]',
              )}
            >
              <option.icon className="size-4 shrink-0" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        <StructuredAiCard insight={insight} title="Incident Action Plan" />
      </CardContent>
    </Card>
  )
}

export function ExecutiveSummaryModule({ executiveInput }: ExecutiveSummaryProps) {
  const insight = useMemo(() => buildExecutiveInsight(executiveInput), [executiveInput])
  const crowdInsight = useMemo(() => buildCrowdInsight(executiveInput.crowd), [executiveInput.crowd])
  const parkingInsight = useMemo(() => buildParkingInsight(executiveInput.parking), [executiveInput.parking])
  const tournamentInsight = useMemo(
    () => buildTournamentInsight(executiveInput.tournament),
    [executiveInput.tournament],
  )
  const emergencyInsight = useMemo(
    () => buildEmergencyInsight(executiveInput.emergencyType),
    [executiveInput.emergencyType],
  )

  const aiCards = [
    {
      title: 'Crowd',
      icon: Users,
      value: crowdInsight.recommendation,
    },
    {
      title: 'Parking',
      icon: MapPinned,
      value: parkingInsight.recommendation,
    },
    {
      title: 'Weather',
      icon: Sparkles,
      value: `${executiveInput.weather.condition}, ${executiveInput.weather.temp}°C, wind ${executiveInput.weather.wind} km/h`,
    },
    {
      title: 'Emergency',
      icon: Siren,
      value: emergencyInsight.recommendation,
    },
    {
      title: 'Tournament',
      icon: Trophy,
      value: tournamentInsight.recommendation,
    },
  ]

  return (
    <Card className="rounded-3xl border border-[var(--color-copilot-border)]/25">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-text-primary">
              <Sparkles className="size-5 text-accent" />
              Executive Dashboard Summary
            </CardTitle>
            <p className="mt-1 text-sm text-text-muted">
              Automatically summarized across crowd, parking, weather, emergency, and tournament operations.
            </p>
          </div>
          <Badge variant="copilot">Executive Brief</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <StructuredAiCard insight={insight} title="Executive Summary Card" />

        <div className="grid gap-4 xl:grid-cols-5">
          {aiCards.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4"
            >
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-muted">
                <card.icon className="size-3.5 text-accent" />
                {card.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{card.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export interface OperationsModulesProps {
  crowd: CrowdZoneInput[]
  parking: ParkingInput[]
  tournament: TournamentInput[]
  weather: WeatherInput
  seatInput: SeatRecommendationInput
  onSeatInputChange: (next: SeatRecommendationInput) => void
  emergencyType: EmergencyType
  onEmergencyTypeChange: (next: EmergencyType) => void
  onRegenerateTournament: () => void
}

export function OperationsModules({
  crowd,
  parking,
  tournament,
  weather,
  seatInput,
  onSeatInputChange,
  emergencyType,
  onEmergencyTypeChange,
  onRegenerateTournament,
}: OperationsModulesProps) {
  const executiveInput = useMemo(
    () => ({
      crowd,
      parking,
      tournament,
      weather,
      emergencyType,
    }),
    [crowd, parking, tournament, weather, emergencyType],
  )

  const platformIntel = useMemo(() => derivePlatformIntel(executiveInput), [executiveInput])

  return (
    <div className="space-y-6">
      <ExecutiveSummaryModule executiveInput={executiveInput} />
      <AICopilotPanel context={executiveInput} seatInput={seatInput} platformIntel={platformIntel} />
      <CrowdIntelligenceModule crowd={crowd} />
      <SeatRecommendationModule seatInput={seatInput} onSeatInputChange={onSeatInputChange} />
      <TournamentSchedulerModule tournament={tournament} onRegenerate={onRegenerateTournament} />
      <ParkingIntelligenceModule parking={parking} />
      <EmergencyResponseModule
        emergencyType={emergencyType}
        onEmergencyTypeChange={onEmergencyTypeChange}
      />
    </div>
  )
}
