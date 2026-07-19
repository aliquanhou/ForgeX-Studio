import { useStore } from '../stores/runtime'

export function WorldModelViewer() {
  const events = useStore((s) => s.events)
  const selectedTaskId = useStore((s) => s.selectedTaskId)

  // Extract facts and file info from events
  const facts = events.filter((e) => e.kind === 'fact_confirmed').slice(-8)
  const tools = events.filter((e) => e.kind.startsWith('tool_')).slice(-15)
  const errors = events.filter((e) => e.kind === 'error' || e.kind === 'tool_failed')

  const stateMetrics = [
    { label: 'Facts', value: facts.length, color: 'text-info' },
    { label: 'Tool Calls', value: tools.length, color: 'text-accent-400' },
    { label: 'Errors', value: errors.length, color: errors.length > 0 ? 'text-error' : 'text-surface-500' },
    { label: 'Coverage', value: '—', color: 'text-surface-500' },
  ]

  return (
    <div className="space-y-3">
      {/* Project knowledge bar */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-xs font-medium text-surface-300 mb-2">Knowledge State</div>
        <div className="grid grid-cols-4 gap-3">
          {stateMetrics.map((m) => (
            <div key={m.label}>
              <div className="text-2xs text-surface-500">{m.label}</div>
              <div className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Coverage bar */}
        <div className="mt-3">
          <div className="flex justify-between text-2xs text-surface-500 mb-1">
            <span>Knowledge Coverage</span>
            <span>—</span>
          </div>
          <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full w-0 bg-accent-500 rounded-full transition-all" />
          </div>
        </div>
      </div>

      {/* Discovered facts */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-xs font-medium text-surface-300 mb-2">Discovered Facts</div>
        {facts.length === 0 ? (
          <div className="text-2xs text-surface-600">No facts discovered yet</div>
        ) : (
          <div className="space-y-1">
            {facts.map((f, i) => (
              <div key={f.event_id} className="flex items-start gap-2 text-2xs">
                <span className="text-info mt-0.5">■</span>
                <span className="text-surface-400">
                  {typeof f.payload === 'object' && (f.payload as Record<string, unknown>).fact
                    ? ((f.payload as Record<string, unknown>).fact as string)
                    : JSON.stringify(f.payload).slice(0, 80)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Impact analysis */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-xs font-medium text-surface-300 mb-2">Impact Analysis</div>
        <div className="text-2xs text-surface-600">
          Impact analysis available after code modification tasks.
        </div>
      </div>

      {/* Architecture layers */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-xs font-medium text-surface-300 mb-2">Architecture Layers</div>
        <div className="flex flex-wrap gap-1">
          {['API', 'Service', 'Domain', 'Infrastructure', 'Config', 'Test'].map((layer) => (
            <span key={layer} className="badge bg-surface-800 text-surface-400">{layer}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
