import { z } from 'zod'

export const copilotActionSchema = z.object({
  label: z.string(),
  action: z.string(),
  variant: z.enum(['primary', 'secondary', 'ghost']).default('primary'),
})

export const copilotResponseSchema = z.object({
  recommendation: z.string(),
  prediction: z.string().optional(),
  summary: z.string(),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  suggestedActions: z.array(copilotActionSchema).min(1).max(3),
})

export type CopilotAction = z.infer<typeof copilotActionSchema>
export type CopilotResponse = z.infer<typeof copilotResponseSchema>

export interface CopilotInsightCardProps {
  recommendation: string
  prediction?: string
  summary: string
  confidence: number
  reasoning: string
  suggestedActions: CopilotAction[]
  timestamp?: Date
}

export function transformCopilotResponse(data: CopilotResponse): CopilotInsightCardProps {
  return {
    recommendation: data.recommendation,
    prediction: data.prediction,
    summary: data.summary,
    confidence: data.confidence,
    reasoning: data.reasoning,
    suggestedActions: data.suggestedActions,
    timestamp: new Date(),
  }
}

export const PLACEHOLDER_COPILOT_INSIGHT: CopilotInsightCardProps = {
  recommendation: 'Increase security staffing in Section C',
  prediction: 'Crowd density will peak at 78,400 in ~22 minutes',
  summary: '3 zones need attention · 2 actions suggested',
  confidence: 94,
  reasoning:
    'Section C density is 340% above average. Historical data from 12 similar events shows elevated congestion risk during this window.',
  suggestedActions: [
    { label: 'Apply Staffing Plan', action: 'apply-staffing', variant: 'primary' },
    { label: 'View Section C', action: 'view-section-c', variant: 'secondary' },
    { label: 'Dismiss', action: 'dismiss', variant: 'ghost' },
  ],
  timestamp: new Date(),
}
