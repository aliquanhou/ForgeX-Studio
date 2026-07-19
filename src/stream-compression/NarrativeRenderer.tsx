/** NarrativeRenderer — 渲染单个 StreamItem（AgentMessage | NarrativeBlock）。 */
import type { AgentMessage } from '../agent-stream/MessageTypes'
import { AgentMessage as AgentMessageCard } from '../agent-stream/AgentMessage'
import type { NarrativeBlock } from './types'
import { GrouperBlock } from './blocks/GrouperBlock'

interface NarrativeRendererProps {
  item: AgentMessage | NarrativeBlock
  isLatest?: boolean
  onSelect?: (type: string, id: string) => void
}

export function NarrativeRenderer({ item, isLatest, onSelect }: NarrativeRendererProps) {
  // NarrativeBlock 类型
  if ('type' in item && (item.type === 'tool_group' || item.type === 'fact_group' || item.type === 'phase_summary')) {
    return <GrouperBlock block={item as NarrativeBlock} isLatest={isLatest} />
  }

  // AgentMessage 类型（单条未压缩消息）
  return (
    <AgentMessageCard
      message={item as AgentMessage}
      isLatest={isLatest}
      onSelect={onSelect as any}
    />
  )
}
