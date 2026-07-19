import type { AgentMessageProps } from '../MessageTypes'

export function ErrorCard({ message }: AgentMessageProps) {
  const error = (message.data.error as string) || (message.data.message as string) || ''
  const detail = (message.data.detail as string) || ''

  return (
    <div className="bg-error/5 border border-error/20 rounded-lg p-3">
      <div className="text-xs text-error font-medium mb-0.5">
        {error || '未知错误'}
      </div>
      {detail && (
        <div className="text-2xs text-surface-400 font-mono">{detail}</div>
      )}
    </div>
  )
}
