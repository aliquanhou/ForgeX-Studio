/** Center column: Agent Activity Stream.
 *  Chronological execution trace of the ForgeX Runtime.
 */
import { useEffect, useRef } from 'react'
import { useStore } from '../stores/runtime'
import { ActivityCard } from './ActivityCard'

export function AgentActivityStream() {
  const events = useStore((s) => s.events)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  // Show last 50 events, filter noisy dupes
  const visible = events.slice(-50)

  if (visible.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-3xl text-surface-700">⏳</div>
          <div className="text-sm text-surface-600">
            Awaiting task...
          </div>
          <div className="text-2xs text-surface-700">
            Enter a goal to begin the execution trace
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900/50 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-surface-300">Agent Activity Stream</span>
          <span className="text-2xs text-surface-600">{visible.length} entries</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-2xs text-surface-500">Live</span>
        </div>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-auto">
        {visible.map((ev, idx) => (
          <ActivityCard
            key={ev.event_id}
            event={ev}
            isLatest={idx === visible.length - 1}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
