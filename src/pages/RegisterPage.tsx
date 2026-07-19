import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Zap, ArrowRight, Eye, EyeOff, Mail, Lock, User, Building2, Check, Briefcase, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuroraBackground } from '@/components/ambient/AuroraBackground'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/useAuth'
import type { UserRole } from '@/lib/api/auth'

const ACCOUNT_TYPES: Array<{ role: UserRole; label: string; description: string; icon: typeof Briefcase }> = [
  { role: 'Organizer', label: 'Organizer', description: 'Run events & operations', icon: Briefcase },
  { role: 'Visitor', label: 'Visitor', description: 'Browse & book tickets', icon: Ticket },
]

interface LocationState {
  from?: string
}

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: EASE },
  }),
}

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const deepLinkTarget = (location.state as LocationState | null)?.from
  const { register, isAuthenticated, user, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<UserRole>('Organizer')
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(deepLinkTarget ?? (user.role === 'Visitor' ? '/visitor' : '/dashboard'), { replace: true })
    }
  }, [isAuthenticated, user, navigate, deepLinkTarget])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLoading(true)
    try {
      const registeredUser = await register(formData.name, formData.email, formData.password, accountType)
      navigate(deepLinkTarget ?? (registeredUser.role === 'Visitor' ? '/visitor' : '/dashboard'), { replace: true })
    } catch {
      // error state is surfaced via useAuth().error
    } finally {
      setLoading(false)
    }
  }

  const passedCount = passwordRequirements.filter((r) => r.test(formData.password)).length

  return (
    <div className="relative min-h-screen flex bg-bg-primary">
      <AuroraBackground />

      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Link to="/" className="flex items-center gap-2.5 mb-12">
              <div className="flex size-10 items-center justify-center rounded-xl accent-gradient">
                <Zap className="size-5 text-white" />
              </div>
              <span className="text-2xl font-semibold text-text-primary tracking-tight">ATHLIX</span>
            </Link>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl font-bold tracking-tight text-text-primary leading-[1.15]"
          >
            Start building the{' '}<span className="text-gradient">stadium of tomorrow</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-4 text-lg text-text-muted leading-relaxed"
          >
            Join 150+ venues already transforming operations with AI-powered intelligence.
          </motion.p>

          {/* Benefits list */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mt-10 space-y-4">
            {[
              { label: '14-day free trial', desc: 'Full access, no credit card needed' },
              { label: 'Setup in minutes', desc: 'Connect your venue systems instantly' },
              { label: 'Dedicated support', desc: 'Onboarding engineer assigned to you' },
              { label: 'SOC-2 compliant', desc: 'Enterprise-grade security from day one' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/20 mt-0.5">
                  <Check className="size-3.5 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{item.label}</div>
                  <div className="text-xs text-text-muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div
          className="pointer-events-none absolute right-0 top-1/4 size-96 opacity-20 blur-[100px]"
          style={{ background: '#6c63ff' }}
          aria-hidden="true"
        />
      </div>

      {/* Right panel — register form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl accent-gradient">
                <Zap className="size-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-text-primary tracking-tight">ATHLIX</span>
            </Link>
          </div>

          <div className="glass-card rounded-3xl p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Create account</h2>
            <p className="mt-1.5 text-sm text-text-muted">Get started with your free trial</p>

            {/* Social sign-up — not yet implemented, disabled until OAuth is wired up */}
            <TooltipProvider delayDuration={150}>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="w-full gap-2 text-sm opacity-50 cursor-not-allowed"
                      aria-disabled="true"
                      onClick={(e) => e.preventDefault()}
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/></svg>
                      Google
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Coming Soon</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      className="w-full gap-2 text-sm opacity-50 cursor-not-allowed"
                      aria-disabled="true"
                      onClick={(e) => e.preventDefault()}
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/></svg>
                      GitHub
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Coming Soon</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border-default)]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-bg-primary px-3 text-text-muted">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  I'm signing up as
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map((option) => (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => setAccountType(option.role)}
                      aria-pressed={accountType === option.role}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        accountType === option.role
                          ? 'border-accent/40 bg-accent/10 text-text-primary'
                          : 'border-[var(--color-border-default)] text-text-muted hover:text-text-primary hover:bg-[var(--color-surface-hover)]',
                      )}
                    >
                      <option.icon className="size-4 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{option.label}</span>
                        <span className="block text-xs text-text-muted truncate">{option.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                    <Input
                      id="reg-name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.name}
                      onChange={handleChange('name')}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="reg-org" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                    <Input
                      id="reg-org"
                      placeholder="Acme Stadium"
                      className="pl-10"
                      value={formData.organization}
                      onChange={handleChange('organization')}
                      autoComplete="organization"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@company.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange('email')}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleChange('password')}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Password strength */}
                {formData.password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 space-y-2"
                  >
                    <div className="flex gap-1">
                      {passwordRequirements.map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors duration-300',
                            i < passedCount
                              ? passedCount <= 2
                                ? 'bg-error'
                                : passedCount === 3
                                  ? 'bg-warning'
                                  : 'bg-success'
                              : 'bg-[var(--color-surface-hover)]',
                          )}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {passwordRequirements.map((req) => (
                        <div key={req.label} className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              'size-3.5 rounded-full flex items-center justify-center transition-colors',
                              req.test(formData.password) ? 'bg-success/20' : 'bg-[var(--color-surface-hover)]',
                            )}
                          >
                            {req.test(formData.password) && <Check className="size-2.5 text-success" />}
                          </div>
                          <span className={cn('text-xs', req.test(formData.password) ? 'text-success' : 'text-text-muted')}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
                Create Account <ArrowRight className="size-4" />
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-text-muted leading-relaxed">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>

            <p className="mt-4 text-center text-sm text-text-muted">
              Already have an account?{' '}
              <Link to="/login" state={location.state} className="text-accent font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
