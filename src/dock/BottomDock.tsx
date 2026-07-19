/** Bottom dock: expert tool tabs (World, Tools, Memory, Artifact, Events). */
import { useState } from 'react'
import { useStore } from '../stores/runtime'
import { WorldModelViewer } from '../panels/WorldModelViewer'
import { ToolExecutionPanel } from '../panels/ToolExecutionPanel'
import { MemoryConsole } from '../panels/MemoryConsole'
import { ArtifactDiffViewer } from '../panels/ArtifactDiffViewer'
import { GitBranch, Terminal, Database, FileDiff, List } from 'lucide-react'

const TABS = [
  { key: 'world', label: 'World Model', icon: GitBranch, component: WorldModelViewer },
  { key: 'tools', label: 'Tools', icon: Terminal, component: ToolExecutionPanel },
  { key: 'memory', label: 'Memory', icon: Database, component: MemoryConsole },
  { key: 'artifact', label: 'Artifact', icon: FileDiff, component: ArtifactDiffViewer },
  { key: 'events', label: 'Events', icon: List, component: EventsRaw },
]

function EventsRaw() {
  const events = useStore((s) => s.events)
  return (
    <div className="space-y-0.5 font-mono text-2xs">
      {events.slice(-30).map((ev) => (
        <div key={ev.event_id} className="flex items-center gap-2 text-surface-400">
          <span className="text-surface-600 w-14 shrink-0">
            {new Date(ev.timestamp).toLocaleTimeString()}
          </span>
          <span className="text-surface-300">{ev.kind}</span>
          <span className="text-surface-600 truncate">{ev.task_id.slice(0, 8)}</span>
        </div>
      ))}
      {events.length === 0 && <div className="text-surface-600 p-4 text-center">No events</div>}
    </div>
  )
}

export function BottomDock() {
  const [activeTab, setActiveTab] = useState('world')

  const tab = TABS.find((t) => t.key === activeTab)
  const Panel = tab?.component || WorldModelViewer

  return (
    <div className="flex flex-col bg-surface-950 border-t border-surface-800">
      {/* Tab bar */}
      <div className="flex items-center bg-surface-900/80 border-b border-surface-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-2xs font-medium border-r border-surface-800 transition-colors
              ${activeTab === t.key
                ? 'text-surface-200 bg-surface-950'
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
              }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-auto" style={{ maxHeight: '180px' }}>
        <div className="panel-body">
          <Panel />
        </div>
      </div>
    </div>
  )
}
