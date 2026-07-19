import { useStore, type ForgeEvent } from '../stores/runtime'

const EVENT_ICONS: Record<string, string> = {
  task_started: '▶',
  task_completed: '✓',
  task_failed: '✗',
  phase_changed: '●',
  intent_classified: '◆',
  plan_created: '△',
  action_selected: '▸',
  tool_started: '⚡',
  tool_completed: '✓',
  tool_failed: '✗',
  fact_confirmed: '■',
  evi_evaluated: '◈',
  artifact_created: '□',
  error: '⚠',
}

function p(event: ForgeEvent, key: string): string {
  const val = (event.payload as Record<string, unknown>)[key]
  return typeof val === 'string' ? val : ''
}

export function RuntimeTimeline() {
  const events = useStore((s) => s.events)
  const selectedTaskId = useStore((s) => s.selectedTaskId)

  const taskEvents = selectedTaskId
    ? events.filter((e) => e.task_id === selectedTaskId)
    : events

  const visible = taskEvents.slice(-50)

  if (visible.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-surface-600 text-xs">
        No events yet. Start a task to see the runtime timeline.
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {visible.map((event) => {
        const icon = EVENT_ICONS[event.kind] || '·'
        const isError = event.kind === 'error' || event.kind === 'tool_failed' || event.kind === 'task_failed'
        const isAction = event.kind === 'action_selected'
        const isTool = event.kind.startsWith('tool_')

        return (
          <div key={event.event_id} className={`timeline-node ${isError ? 'error' : isAction || isTool ? 'active' : ''}`}>
            <div className="flex items-start gap-2">
              <span className={`text-xs mt-0.5 ${isError ? 'text-error' : isAction ? 'text-accent-400' : 'text-surface-500'}`}>
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    isError ? 'text-error' : isAction ? 'text-accent-400' : 'text-surface-300'
                  }`}>
                    {event.kind.replace(/_/g, ' ')}
                  </span>
                  <span className="text-2xs text-surface-600">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {p(event, 'goal') && (
                  <div className="text-2xs text-surface-400 mt-0.5 truncate">{p(event, 'goal')}</div>
                )}
                {p(event, 'error') && (
                  <div className="text-2xs text-error mt-0.5 truncate">{p(event, 'error')}</div>
                )}
                {p(event, 'reason') && (
                  <div className="text-2xs text-surface-500 mt-0.5 truncate">{p(event, 'reason')}</div>
                )}
                {p(event, 'intent') && (
                  <div className="text-2xs text-surface-500 mt-0.5">Intent: {p(event, 'intent').toUpperCase()}</div>
                )}
                {p(event, 'action') && (
                  <span className="badge badge-info mt-0.5">{p(event, 'action')}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
