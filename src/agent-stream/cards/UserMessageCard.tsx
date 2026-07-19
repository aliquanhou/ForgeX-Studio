import type { AgentMessageProps } from '../MessageTypes'

export function UserMessageCard({ message }: AgentMessageProps) {
  const text = (message.data.message as string) || ''
  const mode = (message.data.mode as string) || ''

  return (
    <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-3">
      <div className="text-sm text-surface-100 font-medium leading-relaxed">
        {text}
      </div>
      {mode && (
        <div className="flex items-center gap-2 mt-2">
          <span className="badge badge-info text-2xs">{mode}</span>
        </div>
      )}
    </div>
  )
}
