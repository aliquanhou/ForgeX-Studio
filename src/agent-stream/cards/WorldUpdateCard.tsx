import type { AgentMessageProps } from '../MessageTypes'

export function WorldUpdateCard({ message }: AgentMessageProps) {
  const fact = (message.data.fact as string) || ''
  const source = (message.data.source as string) || ''
  const confidence = message.data.confidence as number | undefined
  const isFinal = message.data.is_final as boolean | undefined

  if (!fact) return null

  // If this is the final LLM response, render as a prominent agent message
  if (isFinal) {
    return (
      <div className="bg-accent-500/5 border border-accent-500/15 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-accent-400">ForgeX Agent</span>
          {confidence !== undefined && (
            <span className="text-2xs text-surface-500">{(confidence * 100).toFixed(0)}% 置信</span>
          )}
        </div>
        <div className="text-sm text-surface-100 leading-relaxed whitespace-pre-wrap">
          {fact}
        </div>
      </div>
    )
  }

  // Regular fact — compact world update
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
