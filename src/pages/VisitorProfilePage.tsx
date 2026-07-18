import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut, Ticket, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useAuth } from '@/contexts/AuthContext'
import { useMyBookings } from '@/hooks/useMyBookings'

export function VisitorProfilePage() {
  useEffect(() => {
    document.title = 'Profile · ATHLIX'
  }, [])

  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { bookings } = useMyBookings()

  const initials = user
    ? user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : '—'

  return (
    <VisitorShell title="Profile">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Profile</h1>
        <p className="mt-0.5 text-sm text-text-muted">Your account details.</p>
      </motion.div>

      <div className="max-w-lg space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <User className="size-4 text-accent" /> Account
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

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-text-primary">
              <Ticket className="size-4 text-accent" /> Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-hover)] px-4 py-3">
              <span className="text-sm text-text-secondary">Total bookings</span>
              <span className="text-lg font-bold text-text-primary tabular-nums">{bookings.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base text-text-primary">Session</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut className="size-4" /> Sign out of this device
            </Button>
          </CardContent>
        </Card>
      </div>
    </VisitorShell>
  )
}
