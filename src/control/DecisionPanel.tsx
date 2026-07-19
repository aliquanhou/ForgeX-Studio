/** Right column: Decision Control Panel.
 *  Shows pending approvals, intent classification, and plan structure.
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

export function DecisionPanel() {
  const events = useStore((s) => s.events)

  const pending = [...events].reverse().find((e) => e.kind === 'decision_pending')
  const decisions = events.filter((e) => e.kind === 'action_selected').slice(-8)
  const approved = events.filter((e) => e.kind === 'decision_approved').pop()
  const lastIntent = [...events].reverse().find((e) => e.kind === 'intent_classified')
  const lastEvi = [...events].reverse().find((e) => e.kind === 'evi_evaluated')

  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-auto">
      {/* Pending approval */}
      {pending && (
        <div className="bg-warning/10 border-2 border-warning/40 rounded-lg p-3">
          <div className="text-2xs text-warning font-semibold mb-2 uppercase tracking-wider">
            ⚠ Decision Pending
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-2xs text-surface-500">Action</div>
              <div className="text-sm font-bold text-surface-100 font-mono">{p(pending, 'action')}</div>
            </div>
            <div>
              <div className="text-2xs text-surface-500">Reason</div>
              <div className="text-xs text-surface-300">{p(pending, 'reason')}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-2xs text-surface-500">Risk</div>
                <span className="badge badge-error text-2xs">{p(pending, 'risk')}</span>
              </div>
              <div>
                <div className="text-2xs text-surface-500">Confidence</div>
                <span className="text-xs text-surface-200 font-mono">{(pn(pending, 'confidence') * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-success hover:bg-success/80 text-white rounded transition-colors">
                Approve
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-error hover:bg-error/80 text-white rounded transition-colors">
                Reject
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-surface-700 hover:bg-surface-600 text-surface-300 rounded transition-colors">
                Revise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approved confirmation */}
      {approved && !pending && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-success text-sm">✓</span>
            <span className="text-xs font-medium text-surface-200">Decision Approved</span>
          </div>
          <div className="text-2xs text-surface-400 mt-1">{p(approved, 'action')}</div>
        </div>
      )}

      {/* Intent */}
      {lastIntent && (
        <div className="bg-surface-900/50 rounded-lg border p-3">
          <div className="text-2xs text-surface-500 mb-2 uppercase tracking-wider">Intent</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-info">{p(lastIntent, 'intent').toUpperCase()}</span>
            <span className="text-2xs text-surface-500">{(pn(lastIntent, 'confidence') * 100).toFixed(0)}%</span>
          </div>
          {p(lastIntent, 'reason') && (
            <div className="text-2xs text-surface-400">{p(lastIntent, 'reason')}</div>
          )}
        </div>
      )}

      {/* EVI Snapshot */}
      {lastEvi && (
        <div className="bg-surface-900/50 rounded-lg border p-3">
          <div className="text-2xs text-surface-500 mb-2 uppercase tracking-wider">EVI Evaluation</div>
          <div className="space-y-1.5">
            <EviBar label="Info Gain" value={pn(lastEvi, 'info_gain')} color="bg-info" />
            <EviBar label="Progress" value={pn(lastEvi, 'progress')} color="bg-success" />
            <EviBar label="Risk Red." value={pn(lastEvi, 'risk_reduction')} color="bg-warning" />
            <EviBar label="Cost" value={pn(lastEvi, 'cost')} color="bg-error" />
          </div>
        </div>
      )}

      {/* Decision History */}
      {decisions.length > 0 && (
        <div>
          <div className="text-2xs text-surface-500 mb-1.5 uppercase tracking-wider">Decision Log</div>
          <div className="space-y-1">
            {decisions.map((d, i) => (
              <div key={d.event_id} className="flex items-center gap-2 bg-surface-900/30 rounded px-2.5 py-1.5">
                <span className="text-2xs text-surface-600 shrink-0">#{(decisions.length - i)}</span>
                <span className="badge badge-info text-2xs shrink-0">{p(d, 'action')}</span>
                <span className="text-2xs text-surface-500 truncate">{p(d, 'reason')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!pending && !lastIntent && decisions.length === 0 && (
        <div className="flex items-center justify-center h-full text-surface-600 text-xs">
          No decisions yet. Start a task to see the control panel.
        </div>
      )}
    </div>
  )
}

function EviBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(value * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-2xs mb-0.5">
        <span className="text-surface-500">{label}</span>
        <span className="text-surface-400 font-mono">{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
