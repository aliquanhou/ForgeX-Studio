/** Single activity card in the Agent Activity Stream. */
import { type ForgeEvent } from '../stores/runtime'

interface ActivityCardProps {
  event: ForgeEvent
  isLatest?: boolean
}

function p(event: ForgeEvent, key: string): string {
  const v = (event.payload as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : ''
}

function pn(event: ForgeEvent, key: string): number {
  const v = (event.payload as Record<string, unknown>)[key]
  return typeof v === 'number' ? v : 0
}

const ACTIVITY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  user_message: { icon: '💬', label: 'You', color: 'text-accent-400' },
  task_started: { icon: '▶', label: 'Task Started', color: 'text-accent-400' },
  task_completed: { icon: '✓', label: 'Task Completed', color: 'text-success' },
  task_failed: { icon: '✗', label: 'Task Failed', color: 'text-error' },
  intent_classified: { icon: '◆', label: 'Intent', color: 'text-info' },
  phase_changed: { icon: '●', label: 'Phase', color: 'text-warning' },
  action_selected: { icon: '▸', label: 'Decision', color: 'text-accent-400' },
  tool_started: { icon: '⚡', label: 'Tool', color: 'text-warning' },
  tool_completed: { icon: '✓', label: 'Tool Done', color: 'text-success' },
  tool_failed: { icon: '✗', label: 'Tool Failed', color: 'text-error' },
  fact_confirmed: { icon: '◈', label: 'Fact', color: 'text-success' },
  evi_evaluated: { icon: '◈', label: 'EVI', color: 'text-info' },
  artifact_created: { icon: '□', label: 'Artifact', color: 'text-accent-400' },
  decision_pending: { icon: '⚠', label: 'Approval Needed', color: 'text-warning' },
  decision_approved: { icon: '✓', label: 'Approved', color: 'text-success' },
  decision_rejected: { icon: '✗', label: 'Rejected', color: 'text-error' },
  error: { icon: '⚠', label: 'Error', color: 'text-error' },
}

export function ActivityCard({ event, isLatest }: ActivityCardProps) {
  const cfg = ACTIVITY_CONFIG[event.kind] || { icon: '·', label: event.kind, color: 'text-surface-500' }
  const ts = new Date(event.timestamp)
  const time = `${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')}`

  // Different card layouts per event kind
  return (
    <div className={`flex items-start gap-3 px-4 py-2.5 border-b border-surface-800 last:border-0
      ${isLatest ? 'bg-accent-500/5' : ''}
      ${event.kind === 'decision_pending' ? 'bg-warning/5' : ''}`}
    >
      {/* Icon column */}
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${event.kind === 'decision_pending' ? 'bg-warning/20' : 'bg-surface-800'}`}
      >
        <span className={`text-xs ${cfg.color}`}>{cfg.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
          <span className="text-2xs text-surface-600">{time}</span>
        </div>
        <ActivityBody event={event} />
      </div>
    </div>
  )
}

function ActivityBody({ event }: { event: ForgeEvent }) {
  switch (event.kind) {
    case 'user_message':
      return (
        <div className="bg-accent-500/10 border border-accent-500/20 rounded-lg p-3">
          <div className="text-sm text-surface-100 font-medium">{p(event, 'message')}</div>
          {p(event, 'mode') && (
            <span className="badge badge-info text-2xs mt-1">{p(event, 'mode')}</span>
          )}
        </div>
      )

    case 'task_started':
      return <div className="text-sm text-surface-200 font-medium">{p(event, 'goal')}</div>

    case 'intent_classified':
      return (
        <div className="flex items-center gap-2">
          <span className="badge badge-info text-2xs">{p(event, 'intent').toUpperCase()}</span>
          <span className="text-xs text-surface-400">{p(event, 'reason')}</span>
        </div>
      )

    case 'action_selected':
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-info text-2xs">{p(event, 'action')}</span>
            <span className="text-xs text-surface-400">{p(event, 'reason')}</span>
          </div>
          {pn(event, 'evi_score') > 0 && (
            <div className="flex gap-3 mt-1 text-2xs text-surface-500">
              <span>EVI: {pn(event, 'evi_score').toFixed(2)}</span>
              {pn(event, 'knowledge_coverage') > 0 && <span>Knowledge: {(pn(event, 'knowledge_coverage') * 100).toFixed(0)}%</span>}
              {pn(event, 'uncertainty_entropy') > 0 && <span>Uncertainty: {pn(event, 'uncertainty_entropy').toFixed(2)}</span>}
            </div>
          )}
        </div>
      )

    case 'phase_changed':
      return (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-surface-500">{p(event, 'from')}</span>
          <span className="text-surface-600">→</span>
          <span className="text-surface-200 font-medium">{p(event, 'to')}</span>
        </div>
      )

    case 'tool_started':
      return (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-warning">{p(event, 'tool')}</span>
          {p(event, 'target') && <span className="text-surface-400 truncate font-mono">{p(event, 'target')}</span>}
          <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
        </div>
      )

    case 'tool_completed':
      return (
        <div className="text-xs">
          <span className="font-mono text-surface-200">{p(event, 'tool')}</span>
          {pn(event, 'duration_ms') > 0 && (
            <span className="text-2xs text-surface-500 ml-2">({pn(event, 'duration_ms').toFixed(0)}ms)</span>
          )}
          {p(event, 'result_summary') && (
            <div className="text-2xs text-surface-400 mt-0.5">{p(event, 'result_summary')}</div>
          )}
          {pn(event, 'evi_score') > 0 && (
            <div className="text-2xs text-surface-500 mt-0.5">EVI: {pn(event, 'evi_score').toFixed(2)}</div>
          )}
        </div>
      )

    case 'fact_confirmed':
      return (
        <div className="text-xs text-surface-300 leading-snug">
          <span className="text-success">◈</span> {p(event, 'fact')}
        </div>
      )

    case 'evi_evaluated':
      return (
        <div className="flex gap-3 text-2xs">
          <span className="text-surface-200 font-mono">Score: {pn(event, 'score').toFixed(2)}</span>
          <span className="text-info">ΔInfo: {pn(event, 'info_gain').toFixed(2)}</span>
          <span className="text-success">ΔProg: {pn(event, 'progress').toFixed(2)}</span>
          <span className="text-warning">ΔRisk: {pn(event, 'risk_reduction').toFixed(2)}</span>
          <span className="text-error">Cost: {pn(event, 'cost').toFixed(2)}</span>
        </div>
      )

    case 'artifact_created':
      return (
        <div className="text-xs">
          <span className="font-mono text-accent-400">{p(event, 'kind')}</span>
          <span className="text-surface-400 mx-1">→</span>
          <span className="font-mono text-surface-300">{p(event, 'path')}</span>
          <span className="text-2xs text-surface-500 ml-2">v{pn(event, 'version')} ({(pn(event, 'size') / 1024).toFixed(1)} KB)</span>
        </div>
      )

    case 'decision_pending':
      return (
        <div className="bg-warning/10 border border-warning/30 rounded p-2 mt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-warning text-2xs">RISK: {p(event, 'risk')}</span>
            <span className="text-xs text-surface-200 font-medium">{p(event, 'action')}</span>
          </div>
          <div className="text-2xs text-surface-400">{p(event, 'reason')}</div>
          <div className="flex gap-2 mt-2">
            <button className="px-3 py-1 text-2xs font-medium bg-success hover:bg-success/80 text-white rounded transition-colors">
              Approve
            </button>
            <button className="px-3 py-1 text-2xs font-medium bg-error hover:bg-error/80 text-white rounded transition-colors">
              Reject
            </button>
            <button className="px-3 py-1 text-2xs font-medium bg-surface-700 hover:bg-surface-600 text-surface-300 rounded transition-colors">
              Modify Plan
            </button>
          </div>
        </div>
      )

    case 'task_completed':
      return (
        <div className="text-xs text-success">
          Completed in {pn(event, 'rounds')} rounds · {pn(event, 'tokens_used')} tokens · {(pn(event, 'elapsed_seconds')).toFixed(1)}s
        </div>
      )

    default:
      return (
        <div className="text-xs text-surface-500">
          {JSON.stringify(event.payload).slice(0, 120)}
        </div>
      )
  }
}
