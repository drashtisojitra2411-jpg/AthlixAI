import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EventSelectOption {
  id: string
  name: string
}

interface EventSelectProps {
  events: EventSelectOption[]
  value: string | null
  onChange: (id: string) => void
}

/**
 * The recurring "pick which event you're looking at" dropdown used in
 * every page header. Centralized so the header select is fixed in one
 * place instead of copy-pasted per page.
 */
export function EventSelect({ events, value, onChange }: EventSelectProps) {
  if (events.length === 0) return null

  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger className="w-auto min-w-[9rem] max-w-[220px]">
        <SelectValue placeholder="Select event" />
      </SelectTrigger>
      <SelectContent>
        {events.map((event) => (
          <SelectItem key={event.id} value={event.id}>
            {event.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
