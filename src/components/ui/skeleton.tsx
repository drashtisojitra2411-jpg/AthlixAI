import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[var(--radius-md)] skeleton-shimmer', className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export { Skeleton }
