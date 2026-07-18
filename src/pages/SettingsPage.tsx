import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Building2, LogOut, Settings as SettingsIcon, Shield, Sparkles, User, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

const NOTIFICATION_KEY = 'athlix_notification_prefs'
const AI_PREFS_KEY = 'athlix_ai_prefs'

interface NotificationPrefs {
  emailAlerts: boolean
  pushAlerts: boolean
  weeklyDigest: boolean
  emergencyAlerts: boolean
}

interface AiPrefs {
  autoInsights: boolean
  verbosity: 'concise' | 'detailed'
  riskThreshold: 'low' | 'medium' | 'high'
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  emailAlerts: true,
  pushAlerts: true,
  weeklyDigest: false,
  emergencyAlerts: true,
}

const DEFAULT_AI_PREFS: AiPrefs = {
  autoInsights: true,
  verbosity: 'concise',
  riskThreshold: 'medium',
}

function loadPrefs<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) }
  } catch {
    return fallback
  }
}

function SettingsHeader() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-default)] bg-bg-primary/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span className="hidden text-sm sm:inline">Command Center</span>
        </Link>

        <div className="h-6 w-px bg-[var(--color-border-default)]" />

        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg accent-gradient">
            <SettingsIcon className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">ATHLIX Settings</span>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="flex size-9 items-center justify-center rounded-xl text-text-muted hover:bg-[var(--color-surface-hover)] hover:text-text-primary transition-colors"
          aria-label="Logout"
          title={user?.fullName}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-3 cursor-pointer">
      <div>
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 accent-[var(--color-accent)]"
      />
    </label>
  )
}

export function SettingsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationPrefs>(() => loadPrefs(NOTIFICATION_KEY, DEFAULT_NOTIFICATIONS))
  const [aiPrefs, setAiPrefs] = useState<AiPrefs>(() => loadPrefs(AI_PREFS_KEY, DEFAULT_AI_PREFS))

  useEffect(() => {
    document.title = 'Settings · ATHLIX'
  }, [])

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem(AI_PREFS_KEY, JSON.stringify(aiPrefs))
  }, [aiPrefs])

  const initials = user
    ? user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : '—'

  return (
    <div className="min-h-screen bg-bg-primary">
      <SettingsHeader />

      <main className="mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
          <p className="mt-0.5 text-sm text-text-muted">Manage your profile, organization, and preferences.</p>
        </motion.div>

        {/* Profile */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <User className="size-4 text-accent" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full accent-gradient text-white text-lg font-semibold">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-text-primary truncate">{user?.fullName ?? '—'}</div>
                <div className="text-sm text-text-muted truncate">{user?.email ?? '—'}</div>
                <Badge variant="outline" className="mt-1.5">{user?.role ?? '—'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <Building2 className="size-4 text-accent" /> Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-text-muted">No organization on file for this account.</p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <Bell className="size-4 text-accent" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5">
            <ToggleRow
              label="Email alerts"
              description="Emergency reports and daily summaries by email"
              checked={notifications.emailAlerts}
              onChange={(next) => setNotifications((p) => ({ ...p, emailAlerts: next }))}
            />
            <ToggleRow
              label="Push alerts"
              description="Real-time browser notifications for critical events"
              checked={notifications.pushAlerts}
              onChange={(next) => setNotifications((p) => ({ ...p, pushAlerts: next }))}
            />
            <ToggleRow
              label="Weekly digest"
              description="A summary of crowd, parking, and revenue trends"
              checked={notifications.weeklyDigest}
              onChange={(next) => setNotifications((p) => ({ ...p, weeklyDigest: next }))}
            />
            <ToggleRow
              label="Emergency alerts"
              description="Immediate notification when an incident is reported"
              checked={notifications.emergencyAlerts}
              onChange={(next) => setNotifications((p) => ({ ...p, emergencyAlerts: next }))}
            />
          </CardContent>
        </Card>

        {/* AI Preferences */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <Sparkles className="size-4 text-accent" /> AI Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <ToggleRow
              label="Auto-generate insights"
              description="Let the AI Copilot surface recommendations without asking"
              checked={aiPrefs.autoInsights}
              onChange={(next) => setAiPrefs((p) => ({ ...p, autoInsights: next }))}
            />
            <div className="rounded-xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <div className="text-sm font-medium text-text-primary">Response verbosity</div>
              <div className="mt-2 flex gap-2">
                {(['concise', 'detailed'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAiPrefs((p) => ({ ...p, verbosity: option }))}
                    className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-colors ${
                      aiPrefs.verbosity === option
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'text-text-muted border border-[var(--color-border-default)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <div className="text-sm font-medium text-text-primary">Risk alert threshold</div>
              <div className="mt-2 flex gap-2">
                {(['low', 'medium', 'high'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAiPrefs((p) => ({ ...p, riskThreshold: option }))}
                    className={`rounded-lg px-3 py-1.5 text-xs capitalize transition-colors ${
                      aiPrefs.riskThreshold === option
                        ? 'bg-accent/15 text-accent border border-accent/30'
                        : 'text-text-muted border border-[var(--color-border-default)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <Shield className="size-4 text-accent" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-text-muted">Role</div>
                <div className="mt-0.5 font-medium text-text-primary">{user?.role ?? '—'}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Member since</div>
                <div className="mt-0.5 font-medium text-text-primary">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
            <SignOutButton />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function SignOutButton() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => {
        logout()
        navigate('/login', { replace: true })
      }}
    >
      <LogOut className="size-4" /> Sign out of this device
    </Button>
  )
}
