import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-surface-hover)] text-text-secondary',
        success: 'bg-[var(--color-success-muted)] text-success',
        warning: 'bg-[var(--color-warning-muted)] text-warning',
        error: 'bg-[var(--color-error-muted)] text-error',
        info: 'bg-[var(--color-info-muted)] text-info',
        copilot: 'bg-[var(--color-copilot-surface)] text-accent border border-[var(--color-copilot-border)]',
        live: 'bg-[var(--color-error-muted)] text-live gap-1.5',
        outline: 'border border-[var(--color-border-default)] text-text-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === 'live' && (
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-live" />
        </span>
      )}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
