import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'accent-gradient text-white shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-strong)] active:scale-[0.97]',
        secondary:
          'glass-card text-text-primary hover:bg-[var(--color-surface-hover)] active:scale-[0.97]',
        ghost:
          'text-text-muted hover:bg-[var(--color-surface-hover)] hover:text-text-primary active:scale-[0.97]',
        danger:
          'bg-error/15 text-error border border-error/30 hover:bg-error/25 active:scale-[0.97]',
        copilot:
          'bg-[var(--color-copilot-surface)] text-accent border border-[var(--color-copilot-border)] hover:shadow-[var(--shadow-glow)] active:scale-[0.97]',
        outline:
          'border border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-surface-hover)] active:scale-[0.97]',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-10 px-5',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)
