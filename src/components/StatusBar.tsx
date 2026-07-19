import { useStore } from '../stores/runtime'

export function StatusBar() {
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)
  const isConnected = useStore((s) => s.isConnected)

  const activeTasks = tasks.filter((t) => t.isRunning).length
  const totalEvents = events.length

  return (
    <footer className="flex items-center justify-between px-3 py-1 bg-surface-900 border-t text-2xs text-surface-500">
      <div className="flex items-center gap-4">
        <span>ForgeX Runtime v0.5 LTS</span>
        <span>Tasks: {tasks.length} ({activeTasks} active)</span>
        <span>Events: {totalEvents}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>SSE: {isConnected ? 'Connected' : 'Idle'}</span>
        <span>Panel View</span>
      </div>
    </footer>
  )
}
