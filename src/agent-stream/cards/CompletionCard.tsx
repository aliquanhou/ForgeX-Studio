import type { AgentMessageProps } from '../MessageTypes'

export function CompletionCard({ message }: AgentMessageProps) {
  const rounds = message.data.rounds as number | undefined
  const tokens = message.data.tokens_used as number | undefined
  const elapsed = message.data.elapsed_seconds as number | undefined
  const isFailed = message.status === 'failed'

  return (
    <div className={`rounded-lg border p-3 ${isFailed ? 'bg-error/5 border-error/20' : 'bg-success/5 border-success/20'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-sm font-semibold ${isFailed ? 'text-error' : 'text-success'}`}>
          {isFailed ? '✗ 任务失败' : '✓ 任务完成'}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-2xs text-surface-500">
        {rounds !== undefined && <span>执行轮次: {rounds}</span>}
        {tokens !== undefined && <span>Token: {tokens.toLocaleString()}</span>}
        {elapsed !== undefined && <span>耗时: {elapsed.toFixed(1)}s</span>}
      </div>
    </div>
  )
}
