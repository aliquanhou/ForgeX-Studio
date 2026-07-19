import type { AgentMessageProps } from '../MessageTypes'

export function PlanCard({ message }: AgentMessageProps) {
  const goal = (message.data.goal as string) || (message.data.result_summary as string) || ''
  const steps = (message.data.steps as string[]) || []
  const planText = (message.data.text as string) || ''

  // If plan has steps from a structured plan event
  if (steps.length > 0) {
    return (
      <div className="bg-surface-900/30 border border-surface-800 rounded-lg p-3 space-y-2">
        {goal && (
          <div>
            <div className="text-2xs text-surface-500 mb-0.5">目标</div>
            <div className="text-xs text-surface-200 font-medium">{goal}</div>
          </div>
        )}
        <div>
          <div className="text-2xs text-surface-500 mb-1">阶段</div>
          <div className="space-y-0.5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-surface-400">
                <span className="w-4 h-4 rounded-full bg-surface-800 flex items-center justify-center text-2xs text-surface-500 shrink-0">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Fallback: show result_summary or plain text
  if (goal) {
    return (
      <div className="bg-surface-900/30 border border-surface-800 rounded-lg p-3">
        <div className="text-xs text-surface-200 font-medium">{goal}</div>
      </div>
    )
  }

  if (planText) {
    return (
      <div className="bg-surface-900/30 border border-surface-800 rounded-lg p-3">
        <div className="text-xs text-surface-300 whitespace-pre-wrap">{planText}</div>
      </div>
    )
  }

  return null
}
