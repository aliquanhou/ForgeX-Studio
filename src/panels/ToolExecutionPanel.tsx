import { useStore, type ForgeEvent } from '../stores/runtime'

function p(event: ForgeEvent, key: string): string {
  const val = (event.payload as Record<string, unknown>)[key]
  return typeof val === 'string' ? val : ''
}

function pn(event: ForgeEvent, key: string): number | null {
  const val = (event.payload as Record<string, unknown>)[key]
  return typeof val === 'number' ? val : null
}

export function ToolExecutionPanel() {
  const events = useStore((s) => s.events)

  const toolEvents = events
    .filter((e) => e.kind.startsWith('tool_'))
    .slice(-20)
    .reverse()

  if (toolEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-surface-600 text-xs">
        No tool calls yet. Tools execute when tasks run.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {toolEvents.map((event) => {
        const isError = event.kind === 'tool_failed' || event.kind === 'tool_rejected'
        const isStarted = event.kind === 'tool_started'
        const toolName = p(event, 'tool') || p(event, 'target') || event.kind.replace('tool_', '')
        const eviScore = pn(event, 'evi_score')

        return (
          <div key={event.event_id} className={`flex items-start gap-2 p-2 rounded text-xs ${
            isError ? 'bg-error/5' : isStarted ? 'bg-surface-900/30' : 'bg-surface-900/10'
          }`}>
            <span className={`mt-0.5 ${
              isError ? 'text-error' : isStarted ? 'text-warning' : 'text-success'
            }`}>
              {isError ? '✗' : isStarted ? '→' : '✓'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isError ? 'text-error' : 'text-surface-200'}`}>
                  {toolName}
                </span>
                {p(event, 'target') && (
                  <span className="text-surface-500 truncate">{p(event, 'target')}</span>
                )}
              </div>
              {isStarted && (
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  <span className="text-2xs text-warning">Running...</span>
                </div>
              )}
              {p(event, 'error') && (
                <div className="text-2xs text-error mt-0.5 truncate">{p(event, 'error')}</div>
              )}
            </div>
            {eviScore !== null && (
              <span className="text-2xs text-surface-500 shrink-0">EVI: {eviScore.toFixed(2)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
