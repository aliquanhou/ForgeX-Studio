import type { AgentMessageProps } from '../MessageTypes'

export function ThoughtCard({ message }: AgentMessageProps) {
  const label = (message.data.label as string) || '思考中'
  const detail = (message.data.detail as string) || (message.data.result_summary as string) || ''
  const isRunning = message.status === 'running'

  return (
    <div className="flex items-start gap-2 py-1">
      {isRunning && (
        <div className="flex items-center gap-2 text-xs text-surface-400">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>{label}</span>
        </div>
      )}
      {!isRunning && detail && (
        <div className="text-xs text-surface-400">{detail}</div>
      )}
      {!isRunning && !detail && (
        <div className="text-xs text-surface-500">{label}</div>
      )}
    </div>
  )
}
