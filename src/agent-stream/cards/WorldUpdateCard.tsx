import type { AgentMessageProps } from '../MessageTypes'

export function WorldUpdateCard({ message }: AgentMessageProps) {
  const fact = (message.data.fact as string) || ''
  const source = (message.data.source as string) || ''
  const confidence = message.data.confidence as number | undefined

  if (!fact) return null

  return (
    <div className="flex items-start gap-2">
      <span className="text-success mt-0.5 shrink-0">◈</span>
      <div>
        <div className="text-xs text-surface-300 leading-snug">{fact}</div>
        <div className="flex items-center gap-2 mt-0.5 text-2xs text-surface-500">
          {source && <span>来源: {source}</span>}
          {confidence !== undefined && (
            <span>置信度: {(confidence * 100).toFixed(0)}%</span>
          )}
        </div>
      </div>
    </div>
  )
}
