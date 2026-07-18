import { z } from 'zod'

export const copilotActionSchema = z.object({
  label: z.string(),
  action: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
})

export type CopilotAction = z.infer<typeof copilotActionSchema>

export interface CopilotInsightCardProps {
  recommendation: string
  prediction?: string
  summary: string
  confidence: number
  reasoning: string
  suggestedActions: CopilotAction[]
  timestamp?: Date
}

