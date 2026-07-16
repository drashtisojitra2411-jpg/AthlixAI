import { memo } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Percent, Car, Siren, HeartPulse, DollarSign, CloudSun, Activity,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface LiveContextData {
  eventName: string
  eventStatus: string
  attendance: number
  crowdPercentage: number
  parkingPercentage: number
  securityAlerts: number
  medicalAlerts: number
  revenue: number
  weatherCondition: string
  weatherTemp: number
}

interface LiveContextPanelProps {
  data: LiveContextData | null
  loading: boolean
}

interface Tile {
  label: string
  value: string
  icon: typeof Users
  tone: 'neutral' | 'warn' | 'good'
}

function buildTiles(data: LiveContextData): Tile[] {
  return [
    { label: 'Crowd', value: `${data.crowdPercentage}%`, icon: Users, tone: data.crowdPercentage >= 85 ? 'warn' : 'neutral' },
    { label: 'Attendance', value: data.attendance.toLocaleString(), icon: Percent, tone: 'neutral' },
    { label: 'Parking', value: `${data.parkingPercentage}%`, icon: Car, tone: data.parkingPercentage >= 90 ? 'warn' : 'neutral' },
    { label: 'Security Alerts', value: String(data.securityAlerts), icon: Siren, tone: data.securityAlerts > 0 ? 'warn' : 'good' },
    { label: 'Medical Alerts', value: String(data.medicalAlerts), icon: HeartPulse, tone: data.medicalAlerts > 0 ? 'warn' : 'good' },
    { label: 'Revenue', value: `$${data.revenue.toLocaleString()}`, icon: DollarSign, tone: 'neutral' },
    { label: 'Weather', value: `${data.weatherTemp}° · ${data.weatherCondition}`, icon: CloudSun, tone: 'neutral' },
    { label: 'Event Status', value: data.eventStatus, icon: Activity, tone: 'neutral' },
  ]
}

function TileCard({ tile, index }: { tile: Tile; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'rounded-2xl border p-3.5',
        tile.tone === 'warn' && 'border-warning/25 bg-warning/5',
        tile.tone === 'good' && 'border-success/20 bg-success/5',
        tile.tone === 'neutral' && 'border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)]',
      )}
    >
      <div className="flex items-center gap-2 text-text-muted">
        <tile.icon className={cn('size-3.5', tile.tone === 'warn' && 'text-warning', tile.tone === 'good' && 'text-success')} />
        <span className="text-[11px] uppercase tracking-[0.14em]">{tile.label}</span>
      </div>
      <div className="mt-1.5 text-lg font-semibold text-text-primary tabular-nums truncate">{tile.value}</div>
    </motion.div>
  )
}

function LiveContextPanelBase({ data, loading }: LiveContextPanelProps) {
  return (
    <div className="glass-card rounded-3xl p-5 lg:sticky lg:top-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-text-primary">Live Event Context</h2>
          <p className="mt-0.5 text-xs text-text-muted truncate max-w-[220px]">
            {data?.eventName ?? 'Select an event'}
          </p>
        </div>
        <Badge variant="live">LIVE</Badge>
      </div>

      {loading || !data ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {buildTiles(data).map((tile, i) => (
            <TileCard key={tile.label} tile={tile} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export const LiveContextPanel = memo(LiveContextPanelBase)
