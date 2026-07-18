import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Users,
  BarChart3,
  ChevronDown,
  Mail,
  Star,
  Eye,
  Car,
  Trophy,
  AlertTriangle,
  MessageSquare,
  Cpu,
  Layers,
  Lock,
  Gauge,
  Wifi,
  MapPin,
  PlayCircle,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuroraBackground } from '@/components/ambient/AuroraBackground'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

/* ============================================================
   ANIMATION PRESETS
   ============================================================ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: EASE },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
}

/* ============================================================
   NAVIGATION BAR
   ============================================================ */
function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'AI', href: '#ai' },
    { label: 'Stadium', href: '#stadium' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="glass-card flex items-center justify-between rounded-2xl px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl accent-gradient">
              <Zap className="size-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-text-primary tracking-tight">ATHLIX</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-lg px-3.5 py-2 text-sm text-text-muted transition-colors hover:text-text-primary hover:bg-[var(--color-surface-hover)]"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">
                Get Started <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex flex-col gap-1.5 md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={cn('block h-0.5 w-5 bg-text-muted transition-transform', mobileOpen && 'translate-y-2 rotate-45')} />
            <span className={cn('block h-0.5 w-5 bg-text-muted transition-opacity', mobileOpen && 'opacity-0')} />
            <span className={cn('block h-0.5 w-5 bg-text-muted transition-transform', mobileOpen && '-translate-y-2 -rotate-45')} />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-2 rounded-2xl p-4 md:hidden"
          >
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="block rounded-lg px-4 py-2.5 text-sm text-text-muted hover:text-text-primary hover:bg-[var(--color-surface-hover)]" onClick={() => setMobileOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--color-border-default)] pt-3">
              <Button variant="ghost" size="sm" asChild><Link to="/login">Sign In</Link></Button>
              <Button size="sm" asChild><Link to="/register">Get Started</Link></Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

/* ============================================================
   HERO SECTION
   ============================================================ */
const heroCapabilities = [
  { icon: Sparkles, label: 'AI Copilot' },
  { icon: MapPin, label: 'Heatmap' },
  { icon: Gauge, label: 'Predictive Operations' },
  { icon: AlertTriangle, label: 'Emergency Command Center' },
]

function HeroSection() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleWatchDemo = () => {
    if (isAuthenticated) {
      navigate('/dashboard/demo')
    } else {
      navigate('/login', { state: { from: '/dashboard/demo' } })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20">
      <AuroraBackground />
      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-[float-particle_8s_ease-in-out_infinite]"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: `${4 + i * 2}px`,
              height: `${4 + i * 2}px`,
              background: 'rgba(108, 99, 255, 0.4)',
              animationDelay: `${i * 1.3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Badge variant="copilot" className="mb-6 px-4 py-1.5 text-sm inline-flex">
            <Sparkles className="size-3.5 mr-1" /> AI-Powered Stadium Intelligence
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-5xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-6xl lg:text-7xl"
        >
          The Future of{' '}
          <span className="text-gradient">Stadium &amp; Tournament</span>{' '}
          Operations
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mx-auto mt-6 max-w-2xl text-lg text-text-muted sm:text-xl leading-relaxed"
        >
          ATHLIX is your AI copilot that transforms raw stadium data into real-time decisions.
          Crowd flow, parking logistics, emergency response — all orchestrated by intelligence.
        </motion.p>

        {/* Capability chips — what ATHLIX actually does, by name */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {heroCapabilities.map((cap) => (
            <Badge key={cap.label} variant="outline" className="gap-1.5 px-3 py-1.5">
              <cap.icon className="size-3.5 text-accent" /> {cap.label}
            </Badge>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button size="lg" asChild className="text-base px-8">
            <Link to="/dashboard">
              Launch Command Center <ArrowRight className="size-5" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" className="text-base px-8 gap-2" onClick={handleWatchDemo}>
            <PlayCircle className="size-5" /> Watch Demo
          </Button>
        </motion.div>

        {/* Animated stats row */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '<50ms', label: 'Response Time' },
            { value: '2M+', label: 'Events Processed' },
            { value: '150+', label: 'Stadiums Active' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-2xl p-4 glass-card-hover">
              <div className="text-2xl font-bold text-gradient tabular-nums">{stat.value}</div>
              <div className="mt-1 text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="size-6 text-text-muted" />
      </motion.div>
    </section>
  )
}

/* ============================================================
   LIVE DASHBOARD PREVIEW
   ============================================================ */
const previewNav = [
  { icon: LayoutDashboard, label: 'Overview' },
  { icon: Sparkles, label: 'AI Copilot' },
  { icon: MapPin, label: 'Heatmap' },
  { icon: Gauge, label: 'Predictive Ops' },
  { icon: AlertTriangle, label: 'Emergency' },
]

const previewStats = [
  { label: 'Live Attendance', value: '95,240', color: '#6c63ff' },
  { label: 'Occupancy', value: '95.24%', color: '#3b82f6' },
  { label: 'Safety Score', value: '100%', color: '#10b981' },
  { label: 'Ticket Revenue', value: '₹27.1Cr', color: '#f59e0b' },
]

const previewZones = [
  { zone: 'General Bowl', pct: 100 },
  { zone: 'North Stand', pct: 99 },
  { zone: 'Grand Pavilion', pct: 98 },
  { zone: 'Skyline Terrace', pct: 97 },
  { zone: 'South Stand', pct: 95 },
]

function DashboardPreview() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="glass-card rounded-3xl p-2 sm:p-3"
        >
          <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-bg-primary/60 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/60" />
                <div className="size-3 rounded-full bg-yellow-500/60" />
                <div className="size-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="mx-auto max-w-xs rounded-lg bg-[var(--color-surface-card)] px-4 py-1.5 text-xs text-text-muted text-center">
                  athlix.ai/dashboard
                </div>
              </div>
            </div>
            {/* Dashboard mock — mirrors the real Command Center layout & data shape */}
            <div className="p-4 sm:p-6 grid grid-cols-12 gap-4">
              {/* Mini nav */}
              <div className="hidden md:flex col-span-3 lg:col-span-2 flex-col gap-1">
                {previewNav.map((item, i) => (
                  <div
                    key={item.label}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs',
                      i === 0 ? 'bg-accent/15 text-accent font-medium' : 'text-text-muted',
                    )}
                  >
                    <item.icon className="size-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">IPL 2026 Final</div>
                    <div className="text-xs text-text-muted">Narendra Modi Stadium</div>
                  </div>
                  <Badge variant="live">LIVE</Badge>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {previewStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="glass-card rounded-xl p-3.5"
                    >
                      <div className="text-lg font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="mt-0.5 text-[11px] text-text-muted">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Crowd zones — heatmap preview */}
                <div className="glass-card rounded-xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary">Crowd Zones</span>
                    <span className="text-[11px] text-text-muted">Live Occupancy</span>
                  </div>
                  <div className="space-y-2.5">
                    {previewZones.map((z, i) => (
                      <div key={z.zone} className="flex items-center gap-3">
                        <span className="w-24 sm:w-28 shrink-0 truncate text-[11px] text-text-muted">{z.zone}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${z.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: z.pct >= 98 ? '#ef4444' : '#6c63ff' }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-text-muted">{z.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   FEATURE BENTO GRID
   ============================================================ */
const features = [
  { icon: Brain, title: 'AI Command Center', desc: 'Neural-network powered insights for real-time stadium decision making.', span: 'lg', accent: '#6c63ff' },
  { icon: Users, title: 'Crowd Intelligence', desc: 'Predict crowd density, flow patterns, and bottlenecks before they happen.', span: 'md', accent: '#3b82f6' },
  { icon: Car, title: 'Smart Parking', desc: 'Dynamic allocation across 10K+ slots with live occupancy heat maps.', span: 'md', accent: '#10b981' },
  { icon: Trophy, title: 'Tournament Ops', desc: 'Multi-bracket scheduling, referee assignments, and live score integration.', span: 'md', accent: '#f59e0b' },
  { icon: AlertTriangle, title: 'Emergency Response', desc: 'AI-triggered protocols, evacuation routing, and first-responder coordination.', span: 'md', accent: '#ef4444' },
  { icon: BarChart3, title: 'Revenue Analytics', desc: 'Concession sales, merchandise tracking, and sponsor ROI dashboards.', span: 'lg', accent: '#8b5cf6' },
]

function FeatureBentoGrid() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Everything Your Stadium{' '}<span className="text-gradient">Needs</span>
          </h2>
          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
            A unified platform that replaces 12+ point solutions with one intelligent command center.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={cn(
                'glass-card glass-card-hover rounded-2xl p-6 group cursor-default',
                f.span === 'lg' && 'sm:col-span-2 lg:col-span-1',
              )}
            >
              <div
                className="flex size-12 items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${f.accent}18` }}
              >
                <f.icon className="size-6" style={{ color: f.accent }} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   AI CAPABILITIES
   ============================================================ */
const aiCapabilities = [
  { icon: Cpu, title: 'Predictive Analytics', desc: 'Forecast attendance, revenue, and incidents 72 hours ahead.' },
  { icon: Eye, title: 'Computer Vision', desc: 'Real-time crowd density analysis from 200+ CCTV feeds.' },
  { icon: MessageSquare, title: 'Natural Language Ops', desc: 'Ask questions in plain English and get instant operational insights.' },
  { icon: Layers, title: 'Auto-Optimization', desc: 'Self-adjusting resource allocation based on live demand signals.' },
]

function AICapabilities() {
  return (
    <section id="ai" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Badge variant="copilot" className="mb-4"><Sparkles className="size-3.5 mr-1" /> AI Copilot</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Powered by{' '}<span className="text-gradient">Intelligence</span>
            </h2>
            <p className="mt-4 text-lg text-text-muted leading-relaxed">
              Our AI engine processes millions of data points per second, turning raw sensor data
              into actionable insights that save lives and maximize revenue.
            </p>

            {/* AI chat preview */}
            <div className="mt-8 glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg accent-gradient">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div className="glass-card rounded-xl rounded-tl-sm px-4 py-2.5 text-sm text-text-secondary">
                  Gate B is approaching 94% capacity. I recommend redirecting incoming traffic to Gate D.
                  Estimated relief time: 8 minutes. Shall I broadcast the announcement?
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="rounded-xl rounded-tr-sm bg-accent/15 px-4 py-2.5 text-sm text-accent border border-accent/20">
                  Yes, redirect and send mobile notifications to Section 200-level ticket holders.
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="size-1.5 rounded-full bg-success animate-pulse" />
                Processing command...
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {aiCapabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="glass-card glass-card-hover rounded-2xl p-5 group"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 mb-3 transition-transform group-hover:scale-110">
                  <cap.icon className="size-5 text-accent" />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{cap.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   STADIUM INTELLIGENCE
   ============================================================ */
const stadiumFeatures = [
  { icon: MapPin, title: 'Zone Mapping', desc: 'Interactive 3D venue maps with real-time heatmaps.', metric: '12 Zones' },
  { icon: Wifi, title: 'IoT Mesh Network', desc: '2,400+ connected sensors across every level.', metric: '2.4K Sensors' },
  { icon: Gauge, title: 'Capacity Monitor', desc: 'Real-time occupancy tracking per section.', metric: '99.8%' },
  { icon: Lock, title: 'Access Control', desc: 'Biometric + NFC ticketing with fraud detection.', metric: '< 2s' },
]

function StadiumIntelligence() {
  return (
    <section id="stadium" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Stadium Intelligence</Badge>
          <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Every Seat. Every Sensor.{' '}<span className="text-gradient">Every Second.</span>
          </h2>
          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
            Transform your venue into a living, breathing data organism that responds to every change in real-time.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stadiumFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="glass-card glass-card-hover rounded-2xl p-6 text-center group"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-accent/10 mx-auto mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <f.icon className="size-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-gradient tabular-nums mb-1">{f.metric}</div>
              <h3 className="font-semibold text-text-primary mb-1">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   TOURNAMENT OPERATIONS
   ============================================================ */
function TournamentOperations() {
  const timeline = [
    { time: '09:00', event: 'Gates Open', status: 'completed' },
    { time: '10:30', event: 'Quarter-Finals Begin', status: 'completed' },
    { time: '14:00', event: 'Semi-Final Round 1', status: 'active' },
    { time: '17:30', event: 'Semi-Final Round 2', status: 'upcoming' },
    { time: '20:00', event: 'Grand Final', status: 'upcoming' },
  ]

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Timeline preview */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-text-primary">Live Tournament Timeline</h3>
              <Badge variant="live">LIVE</Badge>
            </div>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.event}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm text-text-muted tabular-nums w-12 shrink-0">{item.time}</span>
                  <div className={cn(
                    'size-3 rounded-full shrink-0 ring-4',
                    item.status === 'completed' && 'bg-success ring-success/20',
                    item.status === 'active' && 'bg-accent ring-accent/20 animate-pulse',
                    item.status === 'upcoming' && 'bg-[var(--color-border-default)] ring-[var(--color-border-default)]/20',
                  )} />
                  <span className={cn(
                    'text-sm flex-1',
                    item.status === 'active' ? 'text-accent font-medium' : 'text-text-secondary',
                    item.status === 'completed' && 'line-through text-text-muted',
                  )}>
                    {item.event}
                  </span>
                  {item.status === 'active' && <Badge variant="copilot" className="text-xs">In Progress</Badge>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Badge variant="outline" className="mb-4">Tournament Ops</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Orchestrate{' '}<span className="text-gradient">Champions</span>
            </h2>
            <p className="mt-4 text-lg text-text-muted leading-relaxed">
              From bracket generation to medal ceremonies — manage the entire tournament lifecycle
              with AI-optimized scheduling and real-time coordination.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'AI-generated optimal tournament brackets',
                'Real-time score tracking across all venues',
                'Automated referee and official assignments',
                'Live streaming integration with analytics overlay',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/20 mt-0.5">
                    <div className="size-2 rounded-full bg-success" />
                  </div>
                  <span className="text-sm text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   TESTIMONIALS
   ============================================================ */
const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Director of Operations, Mumbai Cricket Association',
    text: 'ATHLIX reduced our incident response time by 73%. The AI copilot anticipates problems before our team even notices them.',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'VP of Venue Tech, Premier League',
    text: 'We manage 20 stadiums through a single ATHLIX dashboard. The crowd intelligence feature alone saved us £2.3M last season.',
    rating: 5,
  },
  {
    name: 'Akiko Tanaka',
    role: 'CTO, Tokyo Olympic Committee',
    text: 'The tournament operations module handled 450+ simultaneous events flawlessly. A game-changer for multi-sport venues.',
    rating: 5,
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Trusted by{' '}<span className="text-gradient">Industry Leaders</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="glass-card glass-card-hover rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, s) => (
                  <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 border-t border-[var(--color-border-default)] pt-4">
                <div className="flex size-10 items-center justify-center rounded-full accent-gradient text-white text-sm font-semibold">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{t.name}</div>
                  <div className="text-xs text-text-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FAQ
   ============================================================ */
const faqs = [
  { q: 'How does ATHLIX integrate with existing stadium systems?', a: 'ATHLIX provides REST & GraphQL APIs plus native connectors for 50+ SCADA, BMS, and POS systems. Our onboarding team ensures zero-downtime migration.' },
  { q: 'What AI models power the copilot?', a: 'We leverage a proprietary ensemble of transformer models fine-tuned on 15+ years of stadium operations data, combined with real-time reinforcement learning for dynamic optimization.' },
  { q: 'Is ATHLIX compliant with data privacy regulations?', a: 'Fully GDPR, CCPA, and SOC-2 Type II compliant. All crowd analytics use privacy-preserving aggregation — no individual tracking or facial recognition.' },
  { q: 'Can ATHLIX handle multi-venue operations?', a: 'Absolutely. Our Enterprise tier supports unlimited venues with centralized dashboards, cross-venue analytics, and shared resource pools.' },
  { q: 'What is the implementation timeline?', a: 'Standard deployment takes 4–6 weeks. Our accelerated program with dedicated engineers can go live in 14 days for single venues.' },
]

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Common{' '}<span className="text-gradient">Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                aria-expanded={openIdx === i}
              >
                <span className="text-sm font-medium text-text-primary pr-4">{faq.q}</span>
                <ChevronDown
                  className={cn('size-5 text-text-muted shrink-0 transition-transform duration-200', openIdx === i && 'rotate-180')}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openIdx === i ? 'auto' : 0, opacity: openIdx === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 text-sm text-text-muted leading-relaxed">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   CTA
   ============================================================ */
function CTASection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at center, #6c63ff 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Ready to Transform Your{' '}<span className="text-gradient">Stadium?</span>
            </h2>
            <p className="mt-4 text-lg text-text-muted max-w-xl mx-auto">
              Join 150+ world-class venues already using ATHLIX to deliver extraordinary experiences.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="text-base px-8">
                <Link to="/register">
                  Start Free Trial <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" className="text-base px-8" asChild>
                <a href="mailto:sales@athlix.ai">Talk to Sales</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-text-muted">No credit card required · 14-day free trial · Cancel anytime</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  const exploreLinks = [
    { label: 'Features', href: '#features' },
    { label: 'AI', href: '#ai' },
    { label: 'Stadium', href: '#stadium' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <footer className="border-t border-[var(--color-border-default)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex size-9 items-center justify-center rounded-xl accent-gradient">
                <Zap className="size-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-text-primary tracking-tight">ATHLIX</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs">
              The AI copilot for intelligent stadium and tournament operations. Built for the future of sports.
            </p>
            <a
              href="mailto:sales@athlix.ai"
              className="mt-6 inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <Mail className="size-4" /> sales@athlix.ai
            </a>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Explore</h4>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-text-muted hover:text-text-primary transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-sm text-text-muted hover:text-text-primary transition-colors">Get Started</Link></li>
              <li><Link to="/dashboard" className="text-sm text-text-muted hover:text-text-primary transition-colors">Command Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-center border-t border-[var(--color-border-default)] pt-8">
          <p className="text-xs text-text-muted">© 2026 ATHLIX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================
   LANDING PAGE
   ============================================================ */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <LandingNav />
      <HeroSection />
      <DashboardPreview />
      <FeatureBentoGrid />
      <AICapabilities />
      <StadiumIntelligence />
      <TournamentOperations />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  )
}
