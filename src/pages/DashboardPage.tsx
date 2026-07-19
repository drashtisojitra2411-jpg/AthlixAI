import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, LayoutDashboard, Users, Car, Trophy, AlertTriangle, BarChart3,
  Settings, Bell, Sparkles, Menu, LogOut,
  TrendingUp, TrendingDown, CloudSun, Clock, Shield,
  Ticket, MapPin, RefreshCw, Sun, Moon, Droplets, Wind,
  Flame, HeartPulse, Siren, MessageCircle,
  PanelLeftClose, PanelLeft, AlertCircle, Inbox, Plus, Loader2, MonitorPlay,
  Percent, Armchair, DollarSign, Target, UtensilsCrossed, ShoppingBag, DoorOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { OperationsModules } from '@/components/dashboard/OperationsModules'
import {
  derivePlatformIntel,
  type EmergencyType,
  type SeatRecommendationInput,
  type WeatherInput,
} from '@/lib/copilot/engine'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useAuth } from '@/contexts/AuthContext'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import { useStadiums } from '@/hooks/useStadiums'
import { createStadium } from '@/lib/api/stadiums'
import { ApiRequestError } from '@/lib/api/client'
import type { ChatMessage, EventOperationalSummary } from '@/lib/api/dashboard'
import { EventSelect } from '@/components/shared/EventSelect'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

// Radix Select items can't have an empty-string value (that's reserved for
// "no selection"), so the "no stadium" option needs a real sentinel value
// that gets translated back to '' at the form-state boundary.
const NO_STADIUM_VALUE = '__none__'

/* ============================================================
   STATIC UI CHROME (no backend equivalent — see integration notes)
   ============================================================ */
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Users, label: 'Crowd Analytics', badge: 'LIVE' },
  { icon: Car, label: 'Parking' },
  { icon: Trophy, label: 'Tournament' },
  { icon: AlertTriangle, label: 'Emergency' },
  { icon: BarChart3, label: 'Revenue' },
  { icon: Ticket, label: 'Ticketing' },
  { icon: Settings, label: 'Settings' },
]

const SIDEBAR_ROUTES: Record<string, string> = {
  'Crowd Analytics': '/dashboard/heatmap',
  Parking: '/dashboard/parking',
  Emergency: '/dashboard/emergency',
  Revenue: '/dashboard/revenue',
  Ticketing: '/dashboard/ticketing',
  Settings: '/dashboard/settings',
}

// Weather and 24h revenue/attendance trend charts have no backend data
// source (no weather API or time-series analytics endpoint exists), so
// these remain illustrative rather than live-wired.
const weatherData: WeatherInput & {
  forecast: Array<{ time: string; temp: number; icon: typeof Sun }>
} = {
  temp: 28,
  condition: 'Partly Cloudy',
  humidity: 65,
  wind: 12,
  forecast: [
    { time: '14:00', temp: 29, icon: Sun },
    { time: '16:00', temp: 27, icon: CloudSun },
    { time: '18:00', temp: 24, icon: CloudSun },
    { time: '20:00', temp: 22, icon: Moon },
  ],
}

const chartData = [40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 92, 78, 85, 90, 87, 94, 91, 88, 93, 96, 89, 85, 82]

/* ============================================================
   SHARED SECTION STATES
   ============================================================ */
function SectionLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  )
}

function SectionError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 text-xs font-medium underline hover:no-underline">
          Retry
        </button>
      )}
    </div>
  )
}

function SectionEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <Inbox className="size-6 text-text-muted" />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}

/* ============================================================
   METRIC CARD COMPONENT
   ============================================================ */
interface ExecutiveMetric {
  label: string
  value: number
  prefix: string
  suffix: string
  trend: number
  icon: typeof Users
  color: string
}

function MetricCard({ metric }: { metric: ExecutiveMetric }) {
  const displayVal = useCountUp(metric.value, { duration: 1200, decimals: metric.value % 1 !== 0 ? 1 : 0 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card glass-card-hover rounded-2xl p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ background: `${metric.color}18` }}
        >
          <metric.icon className="size-5" style={{ color: metric.color }} />
        </div>
        {metric.trend !== 0 && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
            metric.trend >= 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error',
          )}>
            {metric.trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {metric.trend >= 0 ? '+' : ''}{metric.trend}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary tabular-nums">
        {metric.prefix}{typeof displayVal === 'number' ? displayVal.toLocaleString() : displayVal}{metric.suffix}
      </div>
      <div className="mt-1 text-xs text-text-muted">{metric.label}</div>
    </motion.div>
  )
}

/* ============================================================
   MINI CHART
   ============================================================ */
function MiniChart({ data, color = '#6c63ff' }: { data: number[]; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const h = 60
  const w = 200
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${color.replace('#', '')})`}
      />
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />
    </svg>
  )
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const initials = user
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '—'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-bg-primary/80 backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed && !isMobile ? 72 : 260, x: isMobile && collapsed ? -260 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className={cn(
          'fixed top-0 left-0 z-50 h-screen flex flex-col border-r border-[var(--color-border-default)]',
          'bg-bg-primary/80 backdrop-blur-2xl',
          isMobile && 'shadow-2xl',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-[var(--color-border-default)]">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl accent-gradient">
              <Zap className="size-5 text-white" />
            </div>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-semibold text-text-primary tracking-tight whitespace-nowrap overflow-hidden"
                >
                  ATHLIX
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={onToggle}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] text-text-muted transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed && !isMobile ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                item.active
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-text-muted hover:text-text-primary hover:bg-[var(--color-surface-hover)]',
              )}
              title={collapsed && !isMobile ? item.label : undefined}
              onClick={
                item.label === 'Tournament'
                  ? () => document.getElementById('tournament-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  : SIDEBAR_ROUTES[item.label]
                    ? () => navigate(SIDEBAR_ROUTES[item.label])
                    : undefined
              }
            >
              <item.icon className="size-5 shrink-0" />
              <AnimatePresence>
                {(!collapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 text-left whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && (!collapsed || isMobile) && (
                <Badge variant={item.badge === 'LIVE' ? 'live' : 'default'} className="text-[10px] px-1.5">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-[var(--color-border-default)] p-3">
          <div className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5',
            collapsed && !isMobile ? 'justify-center' : '',
          )}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full accent-gradient text-white text-xs font-semibold">
              {initials}
            </div>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <div className="text-sm font-medium text-text-primary truncate">{user?.fullName ?? 'Guest'}</div>
                  <div className="text-xs text-text-muted truncate">{user?.role ?? ''}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {(!collapsed || isMobile) && (
              <button
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

/* ============================================================
   NAVBAR
   ============================================================ */
function NotificationsMenu({ activities }: { activities: ActivityItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex size-9 items-center justify-center rounded-xl hover:bg-[var(--color-surface-hover)] text-text-muted transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="size-5" />
        {activities.length > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-error animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="glass-card absolute right-0 top-11 z-50 w-80 rounded-2xl p-3"
            >
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                Recent Activity
              </div>
              {activities.length === 0 ? (
                <div className="px-2 py-4 text-sm text-text-muted">No recent activity for this event yet.</div>
              ) : (
                <div className="mt-1 max-h-80 space-y-1 overflow-y-auto">
                  {activities.map((activity, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-xl px-2 py-2 hover:bg-[var(--color-surface-hover)]">
                      <activity.icon className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      <div className="min-w-0">
                        <div className="text-xs text-text-secondary leading-relaxed">{activity.action}</div>
                        <div className="mt-0.5 text-[11px] text-text-muted">{activity.by} · {activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function Navbar({ onToggleSidebar, recentActivities }: { onToggleSidebar: () => void; recentActivities: ActivityItem[] }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'sticky top-0 z-30 h-16 border-b border-[var(--color-border-default)]',
        'bg-bg-primary/80 backdrop-blur-2xl flex items-center px-6 gap-4',
      )}
    >
      {isMobile && (
        <button onClick={onToggleSidebar} className="text-text-muted hover:text-text-primary" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Badge variant="live" className="hidden sm:inline-flex">MATCH LIVE</Badge>

        <Button
          variant="copilot"
          size="sm"
          className="hidden sm:inline-flex gap-1.5"
          onClick={() => navigate('/dashboard/copilot')}
        >
          <Sparkles className="size-3.5" /> AI Copilot
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex gap-1.5"
          onClick={() => navigate('/dashboard/demo')}
        >
          <MonitorPlay className="size-3.5" /> Presentation Mode
        </Button>

        <NotificationsMenu activities={recentActivities} />
      </div>
    </motion.header>
  )
}

/* ============================================================
   CROWD ANALYTICS CARDS
   ============================================================ */
interface CrowdZoneDisplay {
  zone: string
  capacity: number
  count: number
  max: number
  status: 'normal' | 'warning' | 'critical'
}

function CrowdAnalyticsSection({ zones }: { zones: CrowdZoneDisplay[] }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Crowd Analytics</h3>
          <p className="text-xs text-text-muted mt-0.5">Real-time zone occupancy</p>
        </div>
        <Badge variant="live">LIVE</Badge>
      </div>
      {zones.length === 0 ? (
        <SectionEmpty message="No crowd data recorded for this event yet." />
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => (
            <div key={zone.zone} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{zone.zone}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted tabular-nums text-xs">{zone.count.toLocaleString()}/{zone.max.toLocaleString()}</span>
                  <span className={cn(
                    'text-xs font-semibold tabular-nums',
                    zone.status === 'critical' && 'text-error',
                    zone.status === 'warning' && 'text-warning',
                    zone.status === 'normal' && 'text-success',
                  )}>
                    {zone.capacity}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${zone.capacity}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    zone.status === 'critical' && 'bg-error',
                    zone.status === 'warning' && 'bg-warning',
                    zone.status === 'normal' && 'bg-success',
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   PARKING STATUS
   ============================================================ */
function ParkingStatus({ lots }: { lots: Array<{ lot: string; total: number; occupied: number; status: 'full' | 'warning' | 'available' }> }) {
  const totalOccupied = lots.reduce((s, p) => s + p.occupied, 0)
  const totalCapacity = lots.reduce((s, p) => s + p.total, 0)
  const overallPercent = totalCapacity === 0 ? 0 : Math.round((totalOccupied / totalCapacity) * 100)

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Parking Status</h3>
          <p className="text-xs text-text-muted mt-0.5">{totalOccupied.toLocaleString()} / {totalCapacity.toLocaleString()} occupied</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-text-primary tabular-nums">{overallPercent}%</span>
        </div>
      </div>

      {lots.length === 0 ? (
        <SectionEmpty message="No parking data recorded for this event yet." />
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {lots.map((lot) => {
            const pct = lot.total === 0 ? 0 : Math.round((lot.occupied / lot.total) * 100)
            return (
              <div key={lot.lot} className="text-center">
                <div className={cn(
                  'relative size-12 mx-auto rounded-xl flex items-center justify-center text-xs font-bold tabular-nums',
                  lot.status === 'full' && 'bg-error/15 text-error',
                  lot.status === 'warning' && 'bg-warning/15 text-warning',
                  lot.status === 'available' && 'bg-success/15 text-success',
                )}>
                  {pct}%
                </div>
                <div className="mt-1.5 text-xs text-text-muted">{lot.lot}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   STADIUM BUSINESS METRICS
   ============================================================ */
interface BusinessMetricTile {
  label: string
  value: string
  icon: typeof Users
}

function buildBusinessMetricTiles(event: EventOperationalSummary['event']): BusinessMetricTile[] {
  return [
    { label: 'Occupancy', value: `${event.occupancyPercentage}%`, icon: Percent },
    { label: 'Seats Booked', value: `${event.seatsBooked.toLocaleString()} / ${event.totalSeats.toLocaleString()}`, icon: Ticket },
    { label: 'Seats Available', value: event.seatsAvailable.toLocaleString(), icon: Armchair },
    { label: 'Avg. Ticket Price', value: `₹${event.averageTicketPrice.toLocaleString()}`, icon: DollarSign },
    { label: 'Ticket Revenue', value: `₹${event.ticketRevenue.toLocaleString()}`, icon: BarChart3 },
    { label: 'Expected Revenue', value: `₹${event.expectedRevenue.toLocaleString()}`, icon: Target },
    { label: 'Parking', value: `${event.parkingOccupied.toLocaleString()} / ${event.parkingCapacity.toLocaleString()}`, icon: Car },
    { label: 'Food Orders', value: event.foodOrders.toLocaleString(), icon: UtensilsCrossed },
    { label: 'Merchandise Sales', value: event.merchandiseSales.toLocaleString(), icon: ShoppingBag },
    { label: 'Entry Gates Open', value: String(event.entryGatesOpen), icon: DoorOpen },
    { label: 'Security Personnel', value: String(event.securityPersonnel), icon: Shield },
    { label: 'Medical Personnel', value: String(event.medicalPersonnel), icon: HeartPulse },
  ]
}

function BusinessMetricsPanel({ event }: { event: EventOperationalSummary['event'] | undefined }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Stadium Business Metrics</h3>
          <p className="text-xs text-text-muted mt-0.5">Seating, revenue & operations</p>
        </div>
      </div>

      {!event ? (
        <SectionEmpty message="No business metrics recorded for this event yet." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {buildBusinessMetricTiles(event).map((tile, i) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3.5"
            >
              <div className="flex items-center gap-2 text-text-muted">
                <tile.icon className="size-3.5" />
                <span className="text-[11px] uppercase tracking-[0.14em]">{tile.label}</span>
              </div>
              <div className="mt-1.5 text-base font-semibold text-text-primary tabular-nums truncate">{tile.value}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   TOURNAMENT TIMELINE
   ============================================================ */
function TournamentTimelineWidget({ matches }: { matches: Array<{ time: string; event: string; status: 'completed' | 'active' | 'upcoming'; venue: string }> }) {
  return (
    <div id="tournament-section" className="glass-card rounded-2xl p-5 scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Tournament Timeline</h3>
          <p className="text-xs text-text-muted mt-0.5">Live match schedule</p>
        </div>
        {matches.length > 0 && <Badge variant="copilot" className="text-xs">{matches.length} matches</Badge>}
      </div>
      {matches.length === 0 ? (
        <SectionEmpty message="No matches scheduled yet." />
      ) : (
        <div className="space-y-3">
          {matches.map((item, i) => (
            <motion.div
              key={`${item.time}-${item.event}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              <div className="flex flex-col items-center shrink-0">
                <div className={cn(
                  'size-2.5 rounded-full ring-4',
                  item.status === 'completed' && 'bg-success ring-success/20',
                  item.status === 'active' && 'bg-accent ring-accent/20 animate-pulse',
                  item.status === 'upcoming' && 'bg-[var(--color-border-default)] ring-[var(--color-border-default)]/20',
                )} />
                {i < matches.length - 1 && (
                  <div className={cn(
                    'w-px h-6 mt-1',
                    item.status === 'completed' ? 'bg-success/30' : 'bg-[var(--color-border-default)]',
                  )} />
                )}
              </div>
              <div className="flex-1 min-w-0 -mt-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'text-sm truncate',
                    item.status === 'active' ? 'text-accent font-medium' : 'text-text-secondary',
                    item.status === 'completed' && 'line-through text-text-muted',
                  )}>
                    {item.event}
                  </span>
                  <span className="text-xs text-text-muted tabular-nums shrink-0">{item.time}</span>
                </div>
                <div className="text-xs text-text-muted mt-0.5">{item.venue}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   EMERGENCY STATUS
   ============================================================ */
interface EmergencyStatusProps {
  totalActive: number
  activeReports: Array<{ type: string }>
}

function EmergencyStatus({ totalActive, activeReports }: EmergencyStatusProps) {
  const allClear = totalActive === 0
  const typeCards: Array<{ label: string; type: 'medical' | 'fire' | 'security'; icon: typeof HeartPulse }> = [
    { label: 'Medical', type: 'medical', icon: HeartPulse },
    { label: 'Fire', type: 'fire', icon: Flame },
    { label: 'Security', type: 'security', icon: Siren },
  ]

  return (
    <div className={cn('glass-card rounded-2xl p-5', allClear ? 'border-success/20' : 'border-error/20')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('flex size-8 items-center justify-center rounded-lg', allClear ? 'bg-success/15' : 'bg-error/15')}>
            <Shield className={cn('size-4', allClear ? 'text-success' : 'text-error')} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Emergency Status</h3>
            <p className={cn('text-xs', allClear ? 'text-success' : 'text-error')}>
              {allClear ? 'All Clear' : `${totalActive} Active`}
            </p>
          </div>
        </div>
        <div className={cn('flex size-10 items-center justify-center rounded-xl', allClear ? 'bg-success/10' : 'bg-error/10')}>
          <span className={cn('text-lg font-bold', allClear ? 'text-success' : 'text-error')}>{allClear ? '✓' : totalActive}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {typeCards.map((item) => {
          const isActive = activeReports.some((report) => report.type === item.type)
          return (
            <div key={item.label} className="text-center p-2 rounded-xl bg-[var(--color-surface-card)]">
              <item.icon className={cn('size-4 mx-auto mb-1', isActive ? 'text-error' : 'text-success')} />
              <div className="text-xs font-medium text-text-primary">{item.label}</div>
              <div className={cn('text-[10px]', isActive ? 'text-error' : 'text-success')}>
                {isActive ? 'Active' : 'Clear'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   COPILOT INSIGHTS PANEL
   ============================================================ */
interface CopilotInsight {
  type: 'warning' | 'info' | 'success' | 'alert'
  message: string
  priority: 'high' | 'medium' | 'low'
}

function CopilotInsightsPanel({ insights }: { insights: CopilotInsight[] }) {
  const navigate = useNavigate()

  return (
    <div className="glass-card rounded-2xl p-5 border-[var(--color-copilot-border)]/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg accent-gradient">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">AI Copilot Insights</h3>
            <p className="text-xs text-text-muted">{insights.length} live recommendations</p>
          </div>
        </div>
        <Button variant="copilot" size="sm" className="text-xs h-7 px-2.5" onClick={() => navigate('/dashboard/copilot')}>
          Ask AI
        </Button>
      </div>
      {insights.length === 0 ? (
        <SectionEmpty message="Insights appear once crowd, parking, and tournament data are live." />
      ) : (
        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'rounded-xl p-3 text-sm border',
                insight.type === 'warning' && 'bg-warning/5 border-warning/20',
                insight.type === 'info' && 'bg-info/5 border-info/20',
                insight.type === 'success' && 'bg-success/5 border-success/20',
                insight.type === 'alert' && 'bg-error/5 border-error/20',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-text-secondary leading-relaxed">{insight.message}</p>
                <Badge variant={insight.priority === 'high' ? 'error' : insight.priority === 'medium' ? 'warning' : 'default'} className="text-[9px] shrink-0">
                  {insight.priority}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   WEATHER WIDGET (static — no backend weather source)
   ============================================================ */
function WeatherWidget() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Weather</h3>
          <p className="text-xs text-text-muted mt-0.5">Illustrative — no live weather source</p>
        </div>
        <MapPin className="size-3.5 text-text-muted" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <div className="text-4xl font-bold text-text-primary tabular-nums">{weatherData.temp}°</div>
          <div className="text-sm text-text-muted">{weatherData.condition}</div>
        </div>
        <CloudSun className="size-12 text-warning/70" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-card)]">
          <Droplets className="size-3.5 text-info" />
          <span className="text-xs text-text-muted">{weatherData.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface-card)]">
          <Wind className="size-3.5 text-text-muted" />
          <span className="text-xs text-text-muted">{weatherData.wind} km/h</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {weatherData.forecast.map((f) => (
          <div key={f.time} className="text-center">
            <div className="text-xs text-text-muted">{f.time}</div>
            <f.icon className="size-4 mx-auto my-1 text-text-muted" />
            <div className="text-xs font-medium text-text-primary tabular-nums">{f.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   RECENT ACTIVITIES
   ============================================================ */
interface ActivityItem {
  action: string
  by: string
  time: string
  icon: typeof Shield
}

function RecentActivities({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary text-sm">Recent Activity</h3>
      </div>
      {activities.length === 0 ? (
        <SectionEmpty message="No recent activity for this event yet." />
      ) : (
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-card)]">
                <activity.icon className="size-4 text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary truncate">{activity.action}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-muted">{activity.by}</span>
                  <span className="text-[10px] text-text-muted">·</span>
                  <span className="text-[10px] text-text-muted">{activity.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   REVENUE CHART (static illustrative trend — no time-series backend)
   ============================================================ */
function RevenueChart() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Revenue Trend</h3>
          <p className="text-xs text-text-muted mt-0.5">Illustrative — last 24 hours</p>
        </div>
      </div>
      <MiniChart data={chartData} color="#6c63ff" />
    </div>
  )
}

/* ============================================================
   ATTENDANCE CHART (static illustrative trend — no time-series backend)
   ============================================================ */
function AttendanceChart() {
  const bars = [35, 55, 45, 70, 85, 90, 78, 92, 88, 95, 80, 75]
  const hours = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p']

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Attendance Flow</h3>
          <p className="text-xs text-text-muted mt-0.5">Illustrative hourly entry rate</p>
        </div>
        <Badge variant="default" className="text-xs">Sample</Badge>
      </div>
      <div className="flex items-end gap-1.5 h-28">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full rounded-t-sm"
              style={{
                background: `linear-gradient(to top, #6c63ff, #3b82f6)`,
                opacity: 0.5 + (h / 100) * 0.5,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {hours.map((h) => (
          <div key={h} className="flex-1 text-center text-[9px] text-text-muted">{h}</div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   EVENT SELECTOR
   ============================================================ */
function EventSelector({
  events,
  selectedEventId,
  onSelect,
  onCreate,
  creating,
  createError,
}: {
  events: Array<{ id: string; name: string }>
  selectedEventId: string | null
  onSelect: (id: string) => void
  onCreate: (input: { name: string; venue: string; stadium?: string; capacity: number; startDate: string; endDate: string; attendance?: number; weather?: string; totalSeats?: number; averageTicketPrice?: number }) => Promise<void>
  creating: boolean
  createError: string | null
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', venue: '', stadium: '', capacity: '', startDate: '', endDate: '', attendance: '', weather: '', totalSeats: '', averageTicketPrice: '' })
  const [showNewStadium, setShowNewStadium] = useState(false)
  const [newStadium, setNewStadium] = useState({ name: '', location: '', capacity: '' })
  const [creatingStadium, setCreatingStadium] = useState(false)
  const [stadiumError, setStadiumError] = useState<string | null>(null)

  const { stadiums, refetch: refetchStadiums } = useStadiums()

  const handleCreate = async () => {
    await onCreate({
      name: form.name,
      venue: form.venue,
      stadium: form.stadium || undefined,
      capacity: Number(form.capacity) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      attendance: form.attendance ? Number(form.attendance) : undefined,
      weather: form.weather || undefined,
      totalSeats: form.totalSeats ? Number(form.totalSeats) : undefined,
      averageTicketPrice: form.averageTicketPrice ? Number(form.averageTicketPrice) : undefined,
    })
    setOpen(false)
    setForm({ name: '', venue: '', stadium: '', capacity: '', startDate: '', endDate: '', attendance: '', weather: '', totalSeats: '', averageTicketPrice: '' })
  }

  const handleCreateStadium = async () => {
    setCreatingStadium(true)
    setStadiumError(null)
    try {
      const { stadium } = await createStadium({
        name: newStadium.name,
        location: newStadium.location,
        capacity: Number(newStadium.capacity) || 0,
      })
      await refetchStadiums()
      setForm((p) => ({ ...p, stadium: stadium.id, venue: p.venue || stadium.name }))
      setShowNewStadium(false)
      setNewStadium({ name: '', location: '', capacity: '' })
    } catch (err) {
      setStadiumError(err instanceof ApiRequestError ? err.message : 'Failed to create stadium')
    } finally {
      setCreatingStadium(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <EventSelect events={events} value={selectedEventId} onChange={onSelect} />

      <Dialog open={open} onOpenChange={setOpen}>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => setOpen(true)}>
          <Plus className="size-3.5" /> New Event
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>Set up an event to start tracking live operations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Event name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />

            <div className="flex items-center gap-2">
              <Select
                value={form.stadium || NO_STADIUM_VALUE}
                onValueChange={(next) => {
                  const stadiumId = next === NO_STADIUM_VALUE ? '' : next
                  const stadium = stadiums.find((s) => s.id === stadiumId)
                  setForm((p) => ({ ...p, stadium: stadiumId, venue: stadium ? stadium.name : p.venue }))
                }}
              >
                <SelectTrigger className="h-9 flex-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_STADIUM_VALUE}>No stadium — enter venue manually</SelectItem>
                  {stadiums.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs shrink-0" onClick={() => setShowNewStadium((v) => !v)}>
                <Plus className="size-3.5" /> Stadium
              </Button>
            </div>

            {showNewStadium && (
              <div className="space-y-2 rounded-xl border border-[var(--color-border-default)] p-3">
                <Input placeholder="Stadium name" value={newStadium.name} onChange={(e) => setNewStadium((p) => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Location" value={newStadium.location} onChange={(e) => setNewStadium((p) => ({ ...p, location: e.target.value }))} />
                <Input type="number" min={0} placeholder="Capacity" value={newStadium.capacity} onChange={(e) => setNewStadium((p) => ({ ...p, capacity: e.target.value }))} />
                {stadiumError && <p className="text-xs text-error">{stadiumError}</p>}
                <Button
                  type="button"
                  size="sm"
                  loading={creatingStadium}
                  disabled={!newStadium.name || !newStadium.location || !newStadium.capacity}
                  onClick={handleCreateStadium}
                >
                  Create Stadium
                </Button>
              </div>
            )}

            <Input placeholder="Venue" value={form.venue} onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))} />
            <Input type="number" min={0} placeholder="Capacity" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
              <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" min={0} placeholder="Total seats for booking" value={form.totalSeats} onChange={(e) => setForm((p) => ({ ...p, totalSeats: e.target.value }))} />
              <Input type="number" min={0} placeholder="Avg. ticket price (₹)" value={form.averageTicketPrice} onChange={(e) => setForm((p) => ({ ...p, averageTicketPrice: e.target.value }))} />
            </div>
            <p className="text-xs text-text-muted -mt-1.5">Total seats and price determine what visitors can book — leave blank if this event isn't ticketed.</p>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" min={0} placeholder="Attendance (optional)" value={form.attendance} onChange={(e) => setForm((p) => ({ ...p, attendance: e.target.value }))} />
              <Input placeholder="Weather (optional)" value={form.weather} onChange={(e) => setForm((p) => ({ ...p, weather: e.target.value }))} />
            </div>
            {createError && (
              <div className="flex items-center gap-2 text-sm text-error">
                <AlertCircle className="size-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!form.name || !form.venue || !form.capacity || !form.startDate || !form.endDate}
            >
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ============================================================
   DASHBOARD PAGE
   ============================================================ */
export function DashboardPage() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile)
  const [seatInput, setSeatInput] = useState<SeatRecommendationInput>({
    budget: 'premium',
    groupSize: 4,
    accessibility: true,
    vip: false,
    coveredSeating: true,
  })
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('medical')

  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
    creating,
    createError,
    createEvent,
    refetch: refetchEvents,
  } = useMyEvents()

  const {
    summary,
    crowd,
    parking,
    tournamentSchedule,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useEventOperationalData(selectedEventId)

  useEffect(() => {
    document.title = 'Command Center · ATHLIX'
  }, [])

  const executiveSummary: ExecutiveMetric[] = useMemo(() => {
    const attendance = crowd.reduce((sum, zone) => sum + zone.count, 0)
    const revenue = (summary?.seating.topRecommendations ?? []).reduce(
      (sum, rec) => sum + rec.pricePerSeat * rec.groupSize,
      0,
    )
    const avgWait = parking.length === 0
      ? 0
      : Math.round((parking.reduce((sum, lot) => sum + lot.walkingMinutes, 0) / parking.length) * 10) / 10
    const safetyScore = summary
      ? Math.max(0, Math.min(100, 100 - summary.emergency.totalActive * 8 - summary.emergency.breachedSlaCount * 12))
      : 100

    return [
      { label: 'Live Attendance', value: attendance, prefix: '', suffix: '', trend: 0, icon: Users, color: '#6c63ff' },
      { label: 'Seat Revenue (Est.)', value: revenue, prefix: '$', suffix: '', trend: 0, icon: BarChart3, color: '#3b82f6' },
      { label: 'Avg. Walking Time', value: avgWait, prefix: '', suffix: 'min', trend: 0, icon: Clock, color: '#10b981' },
      { label: 'Safety Score', value: safetyScore, prefix: '', suffix: '%', trend: 0, icon: Shield, color: '#f59e0b' },
    ]
  }, [crowd, parking, summary])

  const recentActivities: ActivityItem[] = useMemo(() => {
    if (!summary) return []

    const fromEmergencies: Array<ActivityItem & { at: number }> = summary.emergency.activeReports.map((report) => ({
      action: `${report.type.replace('-', ' ')} emergency reported${report.description ? `: ${report.description}` : ''}`,
      by: 'Emergency Report',
      time: new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: AlertTriangle,
      at: new Date(report.createdAt).getTime(),
    }))

    const fromChat: Array<ActivityItem & { at: number }> = summary.engagement.recentMessages.map((message: ChatMessage) => ({
      action: message.message.length > 80 ? `${message.message.slice(0, 80)}…` : message.message,
      by: message.role === 'assistant' ? 'AI Copilot' : 'Attendee',
      time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon: MessageCircle,
      at: new Date(message.createdAt).getTime(),
    }))

    return [...fromEmergencies, ...fromChat]
      .sort((a, b) => b.at - a.at)
      .slice(0, 6)
      .map(({ at: _at, ...item }) => item)
  }, [summary])

  const operationsReady = crowd.length > 0 && parking.length > 0 && tournamentSchedule.length > 0

  const copilotInsights: CopilotInsight[] = useMemo(() => {
    if (!operationsReady) return []

    const intel = derivePlatformIntel({
      crowd,
      parking,
      tournament: tournamentSchedule,
      weather: weatherData,
      emergencyType,
    })

    return intel.systemEvents.map((event) => ({
      type: event.severity === 'critical' ? 'alert' : event.severity === 'warning' ? 'warning' : 'info',
      message: event.summary,
      priority: event.severity === 'critical' ? 'high' : event.severity === 'warning' ? 'medium' : 'low',
    }))
  }, [operationsReady, crowd, parking, tournamentSchedule, emergencyType])

  const activeEmergencyReports = summary?.emergency.activeReports ?? []

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <motion.div
        initial={false}
        animate={{ marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="min-h-screen flex flex-col"
      >
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} recentActivities={recentActivities} />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Command Center</h1>
              <p className="text-sm text-text-muted mt-0.5">
                Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ''}. Here's your event overview.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <EventSelector
                events={events}
                selectedEventId={selectedEventId}
                onSelect={selectEvent}
                onCreate={createEvent}
                creating={creating}
                createError={createError}
              />
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={refetchSummary}>
                <RefreshCw className="size-3.5" /> Refresh
              </Button>
            </div>
          </motion.div>

          {eventsLoading && <SectionLoading label="Loading your events…" />}

          {!eventsLoading && eventsError && (
            <SectionError message={eventsError} onRetry={refetchEvents} />
          )}

          {!eventsLoading && !eventsError && events.length === 0 && (
            <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center gap-3">
              <Inbox className="size-8 text-text-muted" />
              <h3 className="font-semibold text-text-primary">No events yet</h3>
              <p className="text-sm text-text-muted max-w-sm">
                Create your first event to start tracking crowd, parking, tournament, and emergency operations live.
              </p>
              <EventSelector
                events={events}
                selectedEventId={selectedEventId}
                onSelect={selectEvent}
                onCreate={createEvent}
                creating={creating}
                createError={createError}
              />
            </div>
          )}

          {!eventsLoading && !eventsError && events.length > 0 && (
            <>
              {summaryError && <SectionError message={summaryError} onRetry={refetchSummary} />}

              {summaryLoading && <SectionLoading label="Loading operational data…" />}

              {!summaryLoading && !summaryError && (
                <>
                  {/* Executive Summary Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {executiveSummary.map((metric) => (
                      <MetricCard key={metric.label} metric={metric} />
                    ))}
                  </div>

                  {/* Stadium Business Metrics */}
                  <BusinessMetricsPanel event={summary?.event} />

                  {/* Bento Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Column 1 */}
                    <div className="space-y-4">
                      <CrowdAnalyticsSection zones={crowd} />
                      <EmergencyStatus
                        totalActive={summary?.emergency.totalActive ?? 0}
                        activeReports={activeEmergencyReports}
                      />
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                      <RevenueChart />
                      <AttendanceChart />
                      <ParkingStatus lots={parking} />
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-4">
                      <CopilotInsightsPanel insights={copilotInsights} />
                      <TournamentTimelineWidget matches={tournamentSchedule} />
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <RecentActivities activities={recentActivities} />
                    </div>
                    <WeatherWidget />
                  </div>

                  {operationsReady ? (
                    <OperationsModules
                      crowd={crowd}
                      parking={parking}
                      tournament={tournamentSchedule}
                      weather={weatherData}
                      seatInput={seatInput}
                      onSeatInputChange={setSeatInput}
                      emergencyType={emergencyType}
                      onEmergencyTypeChange={setEmergencyType}
                      onRegenerateTournament={refetchSummary}
                    />
                  ) : (
                    <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-2">
                      <Inbox className="size-6 text-text-muted" />
                      <p className="text-sm text-text-muted">
                        Operations modules unlock once this event has crowd, parking, and tournament records.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </motion.div>
    </div>
  )
}
