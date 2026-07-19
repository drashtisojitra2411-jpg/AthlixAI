import type { CopilotInsightCardProps } from '@/lib/copilot/schema'

export function serializeInsight(insight: CopilotInsightCardProps) {
  return [
    `Recommendation: ${insight.recommendation}`,
    `Prediction: ${insight.prediction ?? 'Not provided'}`,
    `Reason: ${insight.reasoning}`,
    `Confidence: ${insight.confidence}%`,
    `Suggested Actions: ${insight.suggestedActions.map((action) => action.label).join(', ')}`,
    `Summary: ${insight.summary}`,
  ].join('\n')
}
