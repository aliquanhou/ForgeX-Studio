import { useStore } from '../stores/runtime'
import type { Timer } from 'lucide-react'

interface PanelMeta {
  icon: typeof Timer
  label: string
  component: React.FC
}

export function Sidebar({ panelMeta }: { panelMeta: Record<string, PanelMeta> }) {
  const visiblePanels = useStore((s) => s.visiblePanels)
  const togglePanel = useStore((s) => s.togglePanel)
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)

  const activeTask = tasks.find((t) => t.isRunning)
  const lastEvent = events[events.length - 1]

  return (
    <aside className="w-12 bg-surface-900 border-r flex flex-col items-center py-2 gap-1">
      {Object.entries(panelMeta).map(([key, meta]) => {
        const Icon = meta.icon
        const visible = visiblePanels[key]
        return (
          <button
            key={key}
            onClick={() => togglePanel(key)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              visible
                ? 'bg-accent-600/20 text-accent-400'
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'
            }`}
            title={meta.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}

      <div className="flex-1" />

      {/* Active indicator */}
      {activeTask && (
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" title={`Task running: ${activeTask.goal.slice(0, 30)}`} />
      )}

      <div className="text-2xs text-surface-600 mt-1">v0.5</div>
    </aside>
  )
}
