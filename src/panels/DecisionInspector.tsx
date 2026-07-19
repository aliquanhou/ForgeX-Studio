import { useStore } from '../stores/runtime'

export function DecisionInspector() {
  const events = useStore((s) => s.events)

  // Find the last action_selected event
  const decisions = events
    .filter((e) => e.kind === 'action_selected')
    .slice(-10)
    .reverse()

  const lastEvi = events.filter((e) => e.kind === 'evi_evaluated').pop()
  const lastIntent = events.filter((e) => e.kind === 'intent_classified').pop()
  const lastFact = events.filter((e) => e.kind === 'fact_confirmed').pop()

  if (decisions.length === 0) {
    return (
      <div className="space-y-4">
        {/* Empty state for engine */}
        <div className="rounded-lg bg-surface-900/50 border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-300">Decision Engine</span>
            <span className="badge badge-info">Ready</span>
          </div>
          <div className="text-2xs text-surface-600">Waiting for task...</div>
        </div>

        {/* Knowledge state skeleton */}
        <div className="rounded-lg bg-surface-900/50 border p-4">
          <span className="text-xs font-medium text-surface-300">Knowledge State</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: 'Coverage', value: '--' },
              { label: 'Uncertainty', value: '--' },
              { label: 'Facts', value: '0' },
              { label: 'Questions', value: '0' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-2xs text-surface-500">{item.label}</div>
                <div className="text-xs text-surface-400 font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const latest = decisions[0]

  return (
    <div className="space-y-4">
      {/* Latest decision */}
      <div className="rounded-lg bg-surface-900/50 border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-surface-300">Latest Decision</span>
          <span className="badge badge-success">CONFIDENT</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-accent-400">
            {((latest.payload.action as string) || '').toUpperCase()}
          </span>
        </div>
        <div className="space-y-1">
          <div className="data-row">
            <span className="data-label">Reason</span>
            <span className="data-value text-surface-400">{(latest.payload.reason as string) || '—'}</span>
          </div>
          <div className="data-row">
            <span className="data-label">Confidence</span>
            <span className="data-value text-success">0.85</span>
          </div>
        </div>
      </div>

      {/* EVI metrics */}
      {lastEvi && (
        <div className="rounded-lg bg-surface-900/50 border p-4">
          <span className="text-xs font-medium text-surface-300">EVI Metrics</span>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { label: 'Info Gain', value: ((lastEvi.payload.info_gain as number) || 0).toFixed(2), color: 'text-info' },
              { label: 'Progress', value: ((lastEvi.payload.progress as number) || 0).toFixed(2), color: 'text-success' },
              { label: 'Risk Reduction', value: ((lastEvi.payload.risk_reduction as number) || 0).toFixed(2), color: 'text-warning' },
              { label: 'Cost', value: ((lastEvi.payload.cost as number) || 0).toFixed(2), color: 'text-error' },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-2xs text-surface-500">{m.label}</div>
                <div className={`text-sm font-mono font-medium ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intent */}
      {lastIntent && (
        <div className="rounded-lg bg-surface-900/50 border p-4">
          <span className="text-xs font-medium text-surface-300">Intent Classification</span>
          <div className="mt-2">
            <span className="badge badge-info">{((lastIntent.payload.intent as string) || '').toUpperCase()}</span>
            <span className="text-2xs text-surface-500 ml-2">
              Confidence: {((lastIntent.payload.confidence as number) || 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Decision history */}
      <div className="rounded-lg bg-surface-900/50 border p-4">
        <span className="text-xs font-medium text-surface-300">Decision History</span>
        <div className="mt-2 space-y-1">
          {decisions.slice(0, 5).map((d, i) => (
            <div key={d.event_id} className="flex items-center justify-between text-2xs py-1 border-b border-surface-800 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-surface-500">#{i + 1}</span>
                <span className="text-accent-400 font-medium">{(d.payload.action as string) || '—'}</span>
              </div>
              <span className="text-surface-500 truncate max-w-[160px]">{(d.payload.reason as string) || ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
