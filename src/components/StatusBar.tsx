/** Status bar: compact runtime metrics across the bottom. */
import { useStore } from '../stores/runtime'

export function StatusBar() {
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)

  const activeTask = tasks.find((t) => t.isRunning)
  const lastEvi = [...events].reverse().find((e) => e.kind === 'evi_evaluated')
  const lastPhaseChange = [...events].reverse().find((e) => e.kind === 'phase_changed')

  const eviScore = lastEvi
    ? ((lastEvi.payload as Record<string, unknown>).score as number) ?? null
    : null
  const phase = lastPhaseChange
    ? ((lastPhaseChange.payload as Record<string, unknown>).to as string) ?? null
    : null
  const tokenEstimate = events.filter((e) => e.kind === 'tool_completed').length * 120
  const hasActive = events.length > 0

  return (
    <footer className="flex items-center justify-between px-3 py-1 bg-surface-900 border-t text-2xs text-surface-500 shrink-0 h-6">
      {/* ── Left group ──────────────────────────── */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              hasActive
                ? 'bg-success animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.5)]'
                : 'bg-surface-600'
            }`}
          />
          <span>{hasActive ? 'Runtime在线' : 'Runtime空闲'}</span>
        </div>

        {activeTask && (
          <>
            <span className="text-surface-700 shrink-0">|</span>
            <span className="flex items-center gap-1 truncate">
              任务:
              <span className="text-surface-300 font-medium truncate max-w-[180px]">
                {activeTask.goal}
              </span>
            </span>
          </>
        )}

        {phase && (
          <>
            <span className="text-surface-700 shrink-0">|</span>
            <span className="shrink-0">
              阶段: <span className="text-surface-300 font-medium">{phase.toUpperCase()}</span>
            </span>
          </>
        )}
      </div>

      {/* ── Right group ─────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        {eviScore !== null && (
          <span>
            EVI: <span className="text-info font-mono">{eviScore.toFixed(2)}</span>
          </span>
        )}
        <span>
          Token: <span className="text-surface-300 font-mono">~{tokenEstimate}</span>
        </span>
        <span className="text-surface-600">v0.2</span>
      </div>
    </footer>
  )
}
