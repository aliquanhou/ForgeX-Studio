/** EventRenderer: 根据消息类型路由到对应的卡片组件。 */
import type { AgentMessageProps } from './MessageTypes'
import { UserMessageCard } from './cards/UserMessageCard'
import { IntentCard } from './cards/IntentCard'
import { PlanCard } from './cards/PlanCard'
import { ThoughtCard } from './cards/ThoughtCard'
import { DecisionCard } from './cards/DecisionCard'
import { ToolCard } from './cards/ToolCard'
import { WorldUpdateCard } from './cards/WorldUpdateCard'
import { ArtifactCard } from './cards/ArtifactCard'
import { CompletionCard } from './cards/CompletionCard'
import { ErrorCard } from './cards/ErrorCard'

export function EventRenderer({ message, isLatest, onSelect }: AgentMessageProps) {
  switch (message.type) {
    case 'user_message':
      return <UserMessageCard message={message} />
    case 'intent':
      return <IntentCard message={message} />
    case 'plan':
      return <PlanCard message={message} />
    case 'thought':
      return <ThoughtCard message={message} />
    case 'decision':
      return <DecisionCard message={message} onSelect={onSelect} />
    case 'tool':
      return <ToolCard message={message} onSelect={onSelect} />
    case 'world_update':
      return <WorldUpdateCard message={message} onSelect={onSelect} />
    case 'artifact':
      return <ArtifactCard message={message} />
    case 'completion':
      return <CompletionCard message={message} />
    case 'error':
      return <ErrorCard message={message} />
    case 'phase_header':
      return <PhaseHeader message={message} />
    default:
      return null
  }
}

/* ── Phase header ──────────────────────────────────── */

function PhaseHeader({ message }: { message: AgentMessageProps['message'] }) {
  const to = (message.data.to as string) || ''
  const from = (message.data.from as string) || ''

  const phaseColors: Record<string, string> = {
    planning: 'border-info/30 text-info',
    exploration: 'border-warning/30 text-warning',
    implementation: 'border-success/30 text-success',
    verification: 'border-info/30 text-info',
    completed: 'border-success/30 text-success',
    failed: 'border-error/30 text-error',
  }

  const phaseIcons: Record<string, string> = {
    planning: '📋',
    exploration: '🔍',
    implementation: '🔧',
    verification: '✓',
    completed: '✅',
    failed: '✗',
  }

  const color = phaseColors[to] || 'border-surface-600/30 text-surface-500'
  const icon = phaseIcons[to] || '●'

  return (
    <div className="px-4 py-2 flex items-center gap-2 select-none">
      <div className="flex-1 h-px bg-surface-800" />
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-2xs font-semibold ${color}`}>
        <span>{icon}</span>
        <span>{to.toUpperCase()}</span>
        {from && <span className="opacity-50">(from {from})</span>}
      </div>
      <div className="flex-1 h-px bg-surface-800" />
    </div>
  )
}
