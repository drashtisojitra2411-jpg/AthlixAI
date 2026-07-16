import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, LayoutDashboard, Users, Car, Trophy, AlertTriangle, BarChart3,
  Settings, Bell, Search, Sparkles, ChevronDown, Menu, LogOut,
  TrendingUp, TrendingDown, CloudSun, Clock, Shield,
  Ticket, MapPin, Megaphone, RefreshCw, Sun, Moon, Droplets, Wind,
  CalendarDays, Flame, HeartPulse, Siren, Radio,
  PanelLeftClose, PanelLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OperationsModules } from '@/components/dashboard/OperationsModules'
import type {
  CrowdZoneInput,
  EmergencyType,
  ParkingInput,
  SeatRecommendationInput,
  TournamentInput,
} from '@/lib/copilot/engine'
import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'
import { useIsMobile } from '@/hooks/useMediaQuery'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

/* ============================================================
   DUMMY DATA
   ============================================================ */
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Users, label: 'Crowd Analytics', badge: 'LIVE' },
  { icon: Car, label: 'Parking', badge: '3' },
  { icon: Trophy, label: 'Tournament' },
  { icon: AlertTriangle, label: 'Emergency' },
  { icon: BarChart3, label: 'Revenue' },
  { icon: Ticket, label: 'Ticketing' },
  { icon: Settings, label: 'Settings' },
]

const executiveSummary = [
  { label: 'Total Attendance', value: 47832, prefix: '', suffix: '', trend: 12.5, icon: Users, color: '#6c63ff' },
  { label: 'Revenue Today', value: 284500, prefix: '$', suffix: '', trend: 8.3, icon: BarChart3, color: '#3b82f6' },
  { label: 'Avg. Wait Time', value: 4.2, prefix: '', suffix: 'min', trend: -18.6, icon: Clock, color: '#10b981' },
  { label: 'Safety Score', value: 98.7, prefix: '', suffix: '%', trend: 2.1, icon: Shield, color: '#f59e0b' },
]

const crowdAnalytics: CrowdZoneInput[] = [
  { zone: 'North Stand', capacity: 94, count: 11280, max: 12000, status: 'critical' },
  { zone: 'South Stand', capacity: 76, count: 9120, max: 12000, status: 'normal' },
  { zone: 'East Wing', capacity: 88, count: 7040, max: 8000, status: 'warning' },
  { zone: 'West Wing', capacity: 62, count: 4960, max: 8000, status: 'normal' },
  { zone: 'VIP Section', capacity: 45, count: 450, max: 1000, status: 'normal' },
]

const parkingData: Array<Omit<ParkingInput, 'walkingMinutes' | 'gate' | 'trafficLevel'>> = [
  { lot: 'Lot A', total: 2500, occupied: 2375, status: 'full' },
  { lot: 'Lot B', total: 2000, occupied: 1640, status: 'available' },
  { lot: 'Lot C', total: 1800, occupied: 1710, status: 'warning' },
  { lot: 'Lot D', total: 1500, occupied: 750, status: 'available' },
  { lot: 'VIP', total: 200, occupied: 156, status: 'available' },
]

const tournamentTimeline = [
  { time: '09:00', event: 'Gates Open', status: 'completed', venue: 'All' },
  { time: '10:30', event: 'Quarter-Final: Team A vs Team B', status: 'completed', venue: 'Court 1' },
  { time: '10:30', event: 'Quarter-Final: Team C vs Team D', status: 'completed', venue: 'Court 2' },
  { time: '14:00', event: 'Semi-Final: Winner QF1 vs Winner QF2', status: 'active', venue: 'Main Arena' },
  { time: '17:30', event: 'Semi-Final: Winner QF3 vs Winner QF4', status: 'upcoming', venue: 'Main Arena' },
  { time: '20:00', event: 'Grand Final', status: 'upcoming', venue: 'Main Arena' },
]

const copilotInsights = [
  { type: 'warning', message: 'North Stand approaching 95% capacity. Recommend gate diversion to South entrance.', time: '2m ago', priority: 'high' },
  { type: 'info', message: 'Concession sales up 23% vs. last match. Top seller: Premium Craft Beer.', time: '5m ago', priority: 'medium' },
  { type: 'success', message: 'Parking Lot B optimal for next 500 vehicles. Auto-routing enabled.', time: '8m ago', priority: 'low' },
  { type: 'alert', message: 'Weather alert: Light rain expected at 16:30. Retractable roof activation queued.', time: '12m ago', priority: 'medium' },
]

const recentActivities = [
  { action: 'Gate C opened for overflow', by: 'AI Copilot', time: '1 min ago', icon: Megaphone },
  { action: 'Emergency drill completed — Section 4', by: 'Security Team', time: '15 min ago', icon: Shield },
  { action: 'VIP parking reassigned to Lot A-Premium', by: 'Parking Ops', time: '23 min ago', icon: Car },
  { action: 'Halftime entertainment cue triggered', by: 'Events Coordinator', time: '30 min ago', icon: Radio },
  { action: 'Food vendor restocking alert resolved', by: 'Concession Mgr', time: '42 min ago', icon: Flame },
]

const weatherData = {
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

function generateTournamentSchedule(seed: number): TournamentInput[] {
  const teamRotations = [
    ['Falcons', 'Titans', 'Warriors', 'Cyclones', 'Royals', 'Phoenix', 'Strikers', 'Comets'],
    ['Royals', 'Falcons', 'Cyclones', 'Titans', 'Comets', 'Warriors', 'Phoenix', 'Strikers'],
    ['Titans', 'Comets', 'Falcons', 'Phoenix', 'Warriors', 'Royals', 'Cyclones', 'Strikers'],
  ]
  const teams = teamRotations[seed % teamRotations.length]

  return [
    { time: '09:00', event: 'Gates Open', status: 'completed', venue: 'All' },
    { time: '10:30', event: `Quarter-Final: ${teams[0]} vs ${teams[1]}`, status: 'completed', venue: 'Court 1' },
    { time: '10:30', event: `Quarter-Final: ${teams[2]} vs ${teams[3]}`, status: 'completed', venue: 'Court 2' },
    { time: '14:00', event: `Semi-Final: ${teams[4]} vs ${teams[5]}`, status: 'active', venue: 'Main Arena' },
    { time: '17:30', event: `Semi-Final: ${teams[6]} vs ${teams[7]}`, status: 'upcoming', venue: 'Main Arena' },
    { time: '20:00', event: 'Grand Final', status: 'upcoming', venue: 'Main Arena' },
  ]
}

/* ============================================================
   METRIC CARD COMPONENT
   ============================================================ */
function MetricCard({ metric }: { metric: typeof executiveSummary[0] }) {
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
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5',
          metric.trend >= 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error',
        )}>
          {metric.trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {metric.trend >= 0 ? '+' : ''}{metric.trend}%
        </div>
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
              DS
            </div>
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <div className="text-sm font-medium text-text-primary truncate">Drashti Shah</div>
                  <div className="text-xs text-text-muted truncate">Stadium Director</div>
                </motion.div>
              )}
            </AnimatePresence>
            {(!collapsed || isMobile) && (
              <button className="text-text-muted hover:text-text-primary transition-colors" aria-label="Logout">
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
function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const isMobile = useIsMobile()

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

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search anything... ⌘K"
            className="w-full h-9 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="live" className="hidden sm:inline-flex">MATCH LIVE</Badge>

        <Button variant="copilot" size="sm" className="hidden sm:inline-flex gap-1.5">
          <Sparkles className="size-3.5" /> AI Copilot
        </Button>

        <button className="relative flex size-9 items-center justify-center rounded-xl hover:bg-[var(--color-surface-hover)] text-text-muted transition-colors" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-error animate-pulse" />
        </button>
      </div>
    </motion.header>
  )
}

/* ============================================================
   CROWD ANALYTICS CARDS
   ============================================================ */
function CrowdAnalyticsSection() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Crowd Analytics</h3>
          <p className="text-xs text-text-muted mt-0.5">Real-time zone occupancy</p>
        </div>
        <Badge variant="live">LIVE</Badge>
      </div>
      <div className="space-y-3">
        {crowdAnalytics.map((zone) => (
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
    </div>
  )
}

/* ============================================================
   PARKING STATUS
   ============================================================ */
function ParkingStatus() {
  const totalOccupied = parkingData.reduce((s, p) => s + p.occupied, 0)
  const totalCapacity = parkingData.reduce((s, p) => s + p.total, 0)
  const overallPercent = Math.round((totalOccupied / totalCapacity) * 100)

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

      <div className="grid grid-cols-5 gap-2">
        {parkingData.map((lot) => {
          const pct = Math.round((lot.occupied / lot.total) * 100)
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
    </div>
  )
}

/* ============================================================
   TOURNAMENT TIMELINE
   ============================================================ */
function TournamentTimelineWidget() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary">Tournament Timeline</h3>
          <p className="text-xs text-text-muted mt-0.5">National Championship 2026</p>
        </div>
        <Badge variant="copilot" className="text-xs">Day 3 of 5</Badge>
      </div>
      <div className="space-y-3">
        {tournamentTimeline.map((item, i) => (
          <motion.div
            key={i}
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
              {i < tournamentTimeline.length - 1 && (
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
    </div>
  )
}

/* ============================================================
   EMERGENCY STATUS
   ============================================================ */
function EmergencyStatus() {
  return (
    <div className="glass-card rounded-2xl p-5 border-success/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-success/15">
            <Shield className="size-4 text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Emergency Status</h3>
            <p className="text-xs text-success">All Clear</p>
          </div>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-success/10">
          <span className="text-lg font-bold text-success">✓</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Medical', icon: HeartPulse, status: 'Standby', color: 'text-success' },
          { label: 'Fire', icon: Flame, status: 'Clear', color: 'text-success' },
          { label: 'Security', icon: Siren, status: 'Active', color: 'text-info' },
        ].map((item) => (
          <div key={item.label} className="text-center p-2 rounded-xl bg-[var(--color-surface-card)]">
            <item.icon className={cn('size-4 mx-auto mb-1', item.color)} />
            <div className="text-xs font-medium text-text-primary">{item.label}</div>
            <div className={cn('text-[10px]', item.color)}>{item.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   COPILOT INSIGHTS PANEL
   ============================================================ */
function CopilotInsightsPanel() {
  return (
    <div className="glass-card rounded-2xl p-5 border-[var(--color-copilot-border)]/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg accent-gradient">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">AI Copilot Insights</h3>
            <p className="text-xs text-text-muted">4 new recommendations</p>
          </div>
        </div>
        <Button variant="copilot" size="sm" className="text-xs h-7 px-2.5">Ask AI</Button>
      </div>
      <div className="space-y-2.5">
        {copilotInsights.map((insight, i) => (
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
              <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0">{insight.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   WEATHER WIDGET
   ============================================================ */
function WeatherWidget() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text-primary text-sm">Weather</h3>
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
function RecentActivities() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary text-sm">Recent Activity</h3>
        <button className="text-xs text-accent hover:underline">View all</button>
      </div>
      <div className="space-y-3">
        {recentActivities.map((activity, i) => (
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
    </div>
  )
}

/* ============================================================
   REVENUE CHART
   ============================================================ */
function RevenueChart() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Revenue Trend</h3>
          <p className="text-xs text-text-muted mt-0.5">Last 24 hours</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-text-primary tabular-nums">$284.5K</div>
          <div className="flex items-center gap-1 text-xs text-success">
            <TrendingUp className="size-3" /> +8.3%
          </div>
        </div>
      </div>
      <MiniChart data={chartData} color="#6c63ff" />
    </div>
  )
}

/* ============================================================
   ATTENDANCE CHART
   ============================================================ */
function AttendanceChart() {
  const bars = [35, 55, 45, 70, 85, 90, 78, 92, 88, 95, 80, 75]
  const hours = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p']

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-text-primary text-sm">Attendance Flow</h3>
          <p className="text-xs text-text-muted mt-0.5">Hourly entry rate</p>
        </div>
        <Badge variant="default" className="text-xs">Today</Badge>
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
   DASHBOARD PAGE
   ============================================================ */
export function DashboardPage() {
  const isMobile = useIsMobile()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile)
  const [seatInput, setSeatInput] = useState<SeatRecommendationInput>({
    budget: 'premium',
    groupSize: 4,
    accessibility: true,
    vip: false,
    coveredSeating: true,
  })
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('medical')
  const [tournamentSeed, setTournamentSeed] = useState(0)
  const tournamentSchedule = generateTournamentSchedule(tournamentSeed)

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <motion.div
        initial={false}
        animate={{ marginLeft: isMobile ? 0 : sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="min-h-screen flex flex-col"
      >
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">Command Center</h1>
              <p className="text-sm text-text-muted mt-0.5">Welcome back, Drashti. Here's your stadium overview.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <RefreshCw className="size-3.5" /> Refresh
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <CalendarDays className="size-3.5" /> Today
                <ChevronDown className="size-3" />
              </Button>
            </div>
          </motion.div>

          {/* Executive Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {executiveSummary.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Column 1 */}
            <div className="space-y-4">
              <CrowdAnalyticsSection />
              <EmergencyStatus />
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <RevenueChart />
              <AttendanceChart />
              <ParkingStatus />
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <CopilotInsightsPanel />
              <TournamentTimelineWidget />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <RecentActivities />
            </div>
            <WeatherWidget />
          </div>

          <OperationsModules
            crowd={crowdAnalytics}
            parking={[
              { ...parkingData[0], walkingMinutes: 4, gate: 'Gate A', trafficLevel: 'High' },
              { ...parkingData[1], walkingMinutes: 6, gate: 'Gate B', trafficLevel: 'Low' },
              { ...parkingData[2], walkingMinutes: 5, gate: 'Gate D', trafficLevel: 'Moderate' },
              { ...parkingData[3], walkingMinutes: 8, gate: 'Gate E', trafficLevel: 'Low' },
              { ...parkingData[4], walkingMinutes: 3, gate: 'VIP Gate', trafficLevel: 'Moderate' },
            ]}
            tournament={tournamentSchedule}
            weather={weatherData}
            seatInput={seatInput}
            onSeatInputChange={setSeatInput}
            emergencyType={emergencyType}
            onEmergencyTypeChange={setEmergencyType}
            onRegenerateTournament={() => setTournamentSeed((seed) => seed + 1)}
          />
        </main>
      </motion.div>
    </div>
  )
}
