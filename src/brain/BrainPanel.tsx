/** Left column: ForgeX current cognitive state.
 *  Represents what the Runtime "knows" at this moment.
 */
import { useStore, type ForgeEvent } from '../stores/runtime'

function p(event: ForgeEvent, key: string): string {
  const v = (event.payload as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : ''
}

function pn(event: ForgeEvent, key: string): number {
  const v = (event.payload as Record<string, unknown>)[key]
  return typeof v === 'number' ? v : 0
}

export function BrainPanel() {
  const events = useStore((s) => s.events)

  const lastTaskStart = [...events].reverse().find((e) => e.kind === 'task_started')
  const lastIntent = [...events].reverse().find((e) => e.kind === 'intent_classified')
  const lastPhaseChange = [...events].reverse().find((e) => e.kind === 'phase_changed')
  const lastEvi = [...events].reverse().find((e) => e.kind === 'evi_evaluated')
  const facts = events.filter((e) => e.kind === 'fact_confirmed')
  const decisions = events.filter((e) => e.kind === 'action_selected')

  const decision = events.filter((e) => e.kind === 'decision_pending').pop()

  const phase = lastPhaseChange ? p(lastPhaseChange, 'to') : 'idle'
  const goal = lastTaskStart ? p(lastTaskStart, 'goal') : ''
  const round = decisions.length

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-auto">
      {/* Phase badge */}
      <div className="flex items-center gap-2">
        <PhaseBadge phase={phase} />
        <span className="text-2xs text-surface-500">r{round}</span>
      </div>

      {/* Goal */}
      {goal && (
        <div>
          <div className="text-2xs text-surface-500 mb-1">GOAL</div>
          <div className="text-xs text-surface-200 font-medium leading-snug">{goal}</div>
        </div>
      )}

      {/* Intent */}
      {lastIntent && (
        <div className="bg-surface-900/50 rounded border p-2.5">
          <div className="text-2xs text-surface-500 mb-1">INTENT</div>
          <div className="flex items-center gap-2">
            <span className="badge badge-info">{p(lastIntent, 'intent').toUpperCase()}</span>
            <span className="text-2xs text-surface-500">
              {(pn(lastIntent, 'confidence') * 100).toFixed(0)}%
            </span>
          </div>
          {p(lastIntent, 'reason') && (
            <div className="text-2xs text-surface-500 mt-1">{p(lastIntent, 'reason')}</div>
          )}
        </div>
      )}

      {/* EVI Metrics */}
      {lastEvi && (
        <div>
          <div className="text-2xs text-surface-500 mb-1.5">EVI METRICS</div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Info Gain', value: pn(lastEvi, 'info_gain'), color: 'text-info' },
              { label: 'Progress', value: pn(lastEvi, 'progress'), color: 'text-success' },
              { label: 'Risk Red.', value: pn(lastEvi, 'risk_reduction'), color: 'text-warning' },
              { label: 'Cost', value: pn(lastEvi, 'cost'), color: 'text-error' },
            ].map((m) => (
              <div key={m.label} className="bg-surface-900/30 rounded px-2 py-1.5">
                <div className="text-2xs text-surface-500">{m.label}</div>
                <div className={`text-xs font-mono font-medium ${m.color}`}>{m.value.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge: Facts Discovered */}
      {facts.length > 0 && (
        <div className="flex-1 min-h-0">
          <div className="text-2xs text-surface-500 mb-1.5">
            KNOWLEDGE ({facts.length} facts)
          </div>
          <div className="space-y-1">
            {facts.slice(-5).reverse().map((f) => (
              <div key={f.event_id} className="text-2xs text-surface-400 flex items-start gap-1.5">
                <span className="text-success mt-0.5 shrink-0">◈</span>
                <span className="leading-snug">{p(f, 'fact').slice(0, 80)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending decision indicator */}
      {decision && (
        <div className="bg-warning/10 border border-warning/30 rounded p-2.5">
          <div className="text-2xs text-warning font-semibold mb-1">⚠ DECISION PENDING</div>
          <div className="text-xs text-surface-200">{p(decision, 'action')}</div>
          <div className="text-2xs text-surface-500 mt-0.5">
            Risk: {p(decision, 'risk')} · Confidence: {(pn(decision, 'confidence') * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  )
}

function PhaseBadge({ phase }: { phase: string }) {
  const colorMap: Record<string, string> = {
    planning: 'badge-info',
    exploration: 'badge-warning',
    implementation: 'badge-success',
    verification: 'badge-info',
    completed: 'badge-success',
    failed: 'badge-error',
    idle: '',
  }
  return (
    <span className={`badge ${colorMap[phase] || 'bg-surface-700 text-surface-400'} text-xs font-semibold`}>
      {phase.toUpperCase()}
    </span>
  )
}
