import { useState } from 'react'
import { useStore } from './stores/runtime'
import { Sidebar } from './components/Sidebar'
import { TaskBar } from './components/TaskBar'
import { RuntimeTimeline } from './panels/RuntimeTimeline'
import { DecisionInspector } from './panels/DecisionInspector'
import { WorldModelViewer } from './panels/WorldModelViewer'
import { MemoryConsole } from './panels/MemoryConsole'
import { ToolExecutionPanel } from './panels/ToolExecutionPanel'
import { ArtifactDiffViewer } from './panels/ArtifactDiffViewer'
import { PluginManager } from './panels/PluginManager'
import { StatusBar } from './components/StatusBar'
import {
  Timer,
  Brain,
  GitBranch,
  Database,
  Terminal,
  FileDiff,
  Puzzle,
} from 'lucide-react'

const PANEL_META: Record<string, { icon: typeof Timer; label: string; component: React.FC }> = {
  timeline: { icon: Timer, label: 'Runtime Timeline', component: RuntimeTimeline },
  decision: { icon: Brain, label: 'Decision Inspector', component: DecisionInspector },
  worldModel: { icon: GitBranch, label: 'World Model', component: WorldModelViewer },
  memory: { icon: Database, label: 'Memory Console', component: MemoryConsole },
  tools: { icon: Terminal, label: 'Tool Execution', component: ToolExecutionPanel },
  artifact: { icon: FileDiff, label: 'Artifacts', component: ArtifactDiffViewer },
  plugins: { icon: Puzzle, label: 'Plugins', component: PluginManager },
}

export default function App() {
  const visiblePanels = useStore((s) => s.visiblePanels)
  const [showNewTask, setShowNewTask] = useState(false)

  const visibleList = Object.entries(PANEL_META).filter(([key]) => visiblePanels[key])

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Title bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b select-none">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-accent-600 flex items-center justify-center text-xs font-bold text-white">
            F
          </div>
          <span className="text-sm font-semibold text-surface-100">ForgeX Studio</span>
          <span className="text-2xs text-surface-500">v0.5 LTS</span>
          <div className="h-4 w-px bg-surface-700 mx-2" />
          <span className="text-xs text-surface-400">Local Development Console</span>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionIndicator />
          <button
            onClick={() => setShowNewTask(!showNewTask)}
            className="px-3 py-1 text-xs font-medium bg-accent-600 hover:bg-accent-500 text-white rounded transition-colors"
          >
            + New Task
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar panelMeta={PANEL_META} />

        {/* Main area — grid of visible panels */}
        <main className="flex-1 grid gap-px bg-surface-800 p-px overflow-hidden"
          style={{
            gridTemplateColumns: visibleList.length >= 2 ? '1fr 1fr' : '1fr',
            gridTemplateRows: visibleList.length >= 3 ? '1fr 1fr' : visibleList.length === 2 ? '1fr' : '1fr',
          }}
        >
          {visibleList.length === 0 ? (
            <div className="flex items-center justify-center bg-surface-950 text-surface-500 text-sm">
              <div className="text-center space-y-2">
                <div className="text-4xl">⊞</div>
                <p>Select panels from the sidebar to begin</p>
              </div>
            </div>
          ) : (
            visibleList.map(([key, meta]) => {
              const Panel = meta.component
              return (
                <div key={key} className="flex flex-col bg-surface-950 overflow-hidden min-h-0">
                  <div className="panel-header">
                    <meta.icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </div>
                  <div className="panel-body">
                    <Panel />
                  </div>
                </div>
              )
            })
          )}
        </main>
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* New Task dialog */}
      {showNewTask && <NewTaskDialog onClose={() => setShowNewTask(false)} />}
    </div>
  )
}

function ConnectionIndicator() {
  const isConnected = useStore((s) => s.isConnected)
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success shadow-[0_0_4px_rgba(34,197,94,0.5)]' : 'bg-surface-600'}`} />
      <span className="text-2xs text-surface-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  )
}

function NewTaskDialog({ onClose }: { onClose: () => void }) {
  const [goal, setGoal] = useState('')
  const connect = useStore((s) => s.connect)
  const addEvent = useStore((s) => s.addEvent)

  const handleSubmit = async () => {
    if (!goal.trim()) return
    try {
      const { createTask } = await import('./api/forge')
      const result = await createTask(goal)
      addEvent({
        kind: 'task_started',
        payload: { goal, task_id: result.task_id },
        task_id: result.task_id,
        event_id: 'local',
        timestamp: new Date().toISOString(),
      })
      connect(result.task_id)
      onClose()
    } catch (e) {
      console.error('Failed to create task', e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface-900 border rounded-lg p-6 w-[480px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-surface-100 mb-4">New Task</h2>
        <textarea
          autoFocus
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Describe what you want ForgeX to do..."
          className="w-full h-24 bg-surface-950 border rounded p-3 text-sm text-surface-200 placeholder-surface-500 resize-none outline-none focus:border-accent-500 transition-colors"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-2xs text-surface-500">⌘+Enter to submit</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-surface-400 hover:text-surface-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} className="px-4 py-1.5 text-xs font-medium bg-accent-600 hover:bg-accent-500 text-white rounded transition-colors">
              Run Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
