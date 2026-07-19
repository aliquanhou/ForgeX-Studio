import type { AgentMessageProps } from '../MessageTypes'

export function IntentCard({ message }: AgentMessageProps) {
  const intent = (message.data.intent as string) || ''
  const confidence = (message.data.confidence as number) ?? (message.data.intent_confidence as number) ?? null
  const reason = (message.data.reason as string) || ''

  return (
    <div className="bg-surface-900/30 border border-surface-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="badge badge-info font-semibold">{intent.toUpperCase() || 'UNKNOWN'}</span>
        {confidence !== null && (
          <span className="text-2xs text-surface-500 font-mono">
            {(confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>
      {reason && (
        <div className="text-xs text-surface-400 leading-snug">{reason}</div>
      )}
    </div>
  )
}
