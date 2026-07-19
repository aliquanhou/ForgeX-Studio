import type { AgentMessageProps } from '../MessageTypes'

export function ToolCard({ message }: AgentMessageProps) {
  const tool = (message.data.tool as string) || ''
  const target = (message.data.target as string) || ''
  const resultSummary = (message.data.result_summary as string) || ''
  const error = (message.data.error as string) || ''
  const duration = message.data.duration_ms as number | undefined
  const eviScore = message.data.evi_score as number | undefined
  const isRunning = message.status === 'running'
  const isFailed = message.status === 'failed'

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      isRunning
        ? 'bg-warning/[0.04] border-warning/20'
        : isFailed
          ? 'bg-error/[0.04] border-error/20'
          : 'bg-surface-900/20 border-surface-800/50'
    }`}>
      {/* 工具名 + 目标 */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs font-mono font-medium ${
          isRunning ? 'text-warning' : isFailed ? 'text-error' : 'text-surface-200'
        }`}>
          {tool || 'tool'}
        </span>
        {target && (
          <span className="text-xs font-mono text-surface-500 truncate">{target}</span>
        )}
        {isRunning && (
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="text-2xs text-warning">运行中...</span>
          </div>
        )}
        {duration !== undefined && !isRunning && (
          <span className="text-2xs text-surface-500 ml-auto">{duration.toFixed(0)}ms</span>
        )}
      </div>

      {/* 结果摘要 */}
      {resultSummary && !isRunning && (
        <div className="text-xs text-surface-400 mt-0.5">{resultSummary}</div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="text-2xs text-error mt-0.5">{error}</div>
      )}

      {/* EVI 指标 */}
      {eviScore !== undefined && !isRunning && (
        <div className="text-2xs text-surface-500 mt-1">
          EVI: <span className="text-info font-mono">{eviScore.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}
