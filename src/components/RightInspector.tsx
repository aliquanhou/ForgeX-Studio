/** Right inspector: tabbed control centre (Task, Decision, World, Memory, Tools, Plugins). */
import { useState } from 'react'
import { useStore } from '../stores/runtime'
import { WorldModelViewer } from '../panels/WorldModelViewer'
import { ToolExecutionPanel } from '../panels/ToolExecutionPanel'
import { MemoryConsole } from '../panels/MemoryConsole'
import { PluginManager } from '../panels/PluginManager'
import { Brain, GitBranch, Database, Terminal, Puzzle, List, X } from 'lucide-react'

const TABS = [
  { key: 'task', label: '任务', icon: List },
  { key: 'decision', label: '决策', icon: Brain },
  { key: 'world', label: '世界', icon: GitBranch },
  { key: 'memory', label: '记忆', icon: Database },
  { key: 'tools', label: '工具', icon: Terminal },
  { key: 'plugins', label: '插件', icon: Puzzle },
] as const

type TabKey = (typeof TABS)[number]['key']

interface RightInspectorProps {
  collapsed: boolean
  onToggle: () => void
}

export function RightInspector({ collapsed, onToggle }: RightInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('task')

  if (collapsed) return null

  return (
    <aside className="w-64 bg-surface-950 border-l border-surface-800 flex flex-col overflow-hidden shrink-0">
      {/* ── Tab bar ─────────────────────────────────────── */}
      <div className="flex flex-wrap bg-surface-900/50 border-b border-surface-800 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-2xs font-medium border-r border-surface-800 transition-colors ${
              activeTab === tab.key
                ? 'text-surface-200 bg-surface-950'
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onToggle}
          className="px-2 py-1.5 text-surface-500 hover:text-surface-300 transition-colors"
          title="Close inspector"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* ── Tab content ─────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {activeTab === 'task' && <TaskTab />}
          {activeTab === 'decision' && <DecisionTab />}
          {activeTab === 'world' && <WorldModelViewer />}
          {activeTab === 'memory' && <MemoryConsole />}
          {activeTab === 'tools' && <ToolExecutionPanel />}
          {activeTab === 'plugins' && <PluginManager />}
        </div>
      </div>
    </aside>
  )
}

/* ── Task tab ─────────────────────────────────────────── */

function TaskTab() {
  const tasks = useStore((s) => s.tasks)
  const events = useStore((s) => s.events)

  const activeTask = tasks.find((t) => t.isRunning)
  const lastTask = tasks[tasks.length - 1]
  const task = activeTask || lastTask

  if (!task) {
    return (
      <div className="flex items-center justify-center h-32 text-2xs text-surface-600">
        No active task
      </div>
    )
  }

  const lastPhaseChange = [...events].reverse().find((e) => e.kind === 'phase_changed')
  const phase = lastPhaseChange
    ? ((lastPhaseChange.payload as Record<string, unknown>).to as string)
    : task.phase

  const completedTasks = tasks.filter((t) => !t.isRunning && t.success === true).length
  const failedTasks = tasks.filter((t) => !t.isRunning && t.success === false).length

  return (
    <div className="space-y-3">
      {/* Current task */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-2xs text-surface-500 mb-1.5 uppercase tracking-wider">
          Current Task
        </div>
        <div className="text-sm font-medium text-surface-200 leading-snug mb-2">
          {task.goal}
        </div>
        <div className="flex items-center gap-2">
          <PhaseBadge phase={phase} />
          <span className="text-2xs text-surface-500">Round {task.round}</span>
          {task.isRunning && (
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-2xs text-success">Running</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick metrics */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-2xs text-surface-500 mb-1.5 uppercase tracking-wider">
          Metrics
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Events', value: events.length },
            { label: 'Rounds', value: task.round },
            {
              label: 'Status',
              value: task.isRunning
                ? 'Active'
                : task.success === true
                  ? 'Done'
                  : task.success === false
                    ? 'Failed'
                    : '—',
            },
            { label: 'Phase', value: phase.toUpperCase() },
            { label: 'Completed', value: completedTasks },
            { label: 'Failed', value: failedTasks },
          ].map((m) => (
            <div key={m.label} className="bg-surface-800/30 rounded px-2 py-1.5">
              <div className="text-2xs text-surface-500">{m.label}</div>
              <div className="text-xs font-mono text-surface-200">{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Decision tab ─────────────────────────────────────── */

function DecisionTab() {
  const events = useStore((s) => s.events)

  const lastIntent = [...events].reverse().find((e) => e.kind === 'intent_classified')
  const lastEvi = [...events].reverse().find((e) => e.kind === 'evi_evaluated')
  const decisions = events.filter((e) => e.kind === 'action_selected').slice(-8)
  const pending = [...events].reverse().find((e) => e.kind === 'decision_pending')
  const approved = events.filter((e) => e.kind === 'decision_approved').pop()

  const p = (event: unknown, key: string) => {
    const v = ((event as { payload: Record<string, unknown> }).payload)[key]
    return typeof v === 'string' ? v : ''
  }
  const pn = (event: unknown, key: string) => {
    const v = ((event as { payload: Record<string, unknown> }).payload)[key]
    return typeof v === 'number' ? v : 0
  }

  if (!lastIntent && decisions.length === 0 && !pending) {
    return (
      <div className="flex items-center justify-center h-32 text-2xs text-surface-600">
        No decisions yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Pending approval */}
      {pending && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-2.5">
          <div className="text-2xs text-warning font-semibold mb-1">⚠ Pending</div>
          <div className="text-xs font-mono text-surface-200">{p(pending, 'action')}</div>
          <div className="text-2xs text-surface-500 mt-0.5">{p(pending, 'reason')}</div>
          <div className="flex gap-1.5 mt-2">
            <button className="flex-1 px-2 py-1 text-2xs font-medium bg-success hover:bg-success/80 text-white rounded transition-colors">
              Approve
            </button>
            <button className="flex-1 px-2 py-1 text-2xs font-medium bg-error hover:bg-error/80 text-white rounded transition-colors">
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Approved confirmation */}
      {approved && !pending && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-success text-xs">✓</span>
            <span className="text-2xs font-medium text-surface-200">Approved</span>
          </div>
          <div className="text-2xs text-surface-400 mt-0.5">{p(approved, 'action')}</div>
        </div>
      )}

      {/* Intent classification */}
      {lastIntent && (
        <div className="bg-surface-900/50 border rounded-lg p-2.5">
          <div className="text-2xs text-surface-500 mb-1">Intent</div>
          <div className="flex items-center gap-2">
            <span className="badge badge-info text-2xs">
              {p(lastIntent, 'intent').toUpperCase()}
            </span>
            <span className="text-2xs text-surface-500">
              {(pn(lastIntent, 'confidence') * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* EVI snapshot */}
      {lastEvi && (
        <div className="bg-surface-900/50 border rounded-lg p-2.5">
          <div className="text-2xs text-surface-500 mb-1.5">EVI</div>
          <div className="space-y-1.5">
            <MiniBar label="Info Gain" value={pn(lastEvi, 'info_gain')} color="bg-info" />
            <MiniBar label="Progress" value={pn(lastEvi, 'progress')} color="bg-success" />
            <MiniBar label="Risk Red." value={pn(lastEvi, 'risk_reduction')} color="bg-warning" />
            <MiniBar label="Cost" value={pn(lastEvi, 'cost')} color="bg-error" />
          </div>
        </div>
      )}

      {/* Decision history */}
      {decisions.length > 0 && (
        <div>
          <div className="text-2xs text-surface-500 mb-1">Decision Log</div>
          <div className="space-y-0.5">
            {decisions.map((d) => (
              <div
                key={d.event_id}
                className="flex items-center gap-2 bg-surface-900/20 rounded px-2 py-1.5"
              >
                <span className="badge badge-info text-2xs">{p(d, 'action')}</span>
                <span className="text-2xs text-surface-500 truncate">{p(d, 'reason')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Shared helpers ───────────────────────────────────── */

function PhaseBadge({ phase }: { phase: string }) {
  const colorMap: Record<string, string> = {
    planning: 'badge-info',
    exploration: 'badge-warning',
    implementation: 'badge-success',
    verification: 'badge-info',
    completed: 'badge-success',
    failed: 'badge-error',
  }
  return (
    <span
      className={`badge ${colorMap[phase] || 'bg-surface-700 text-surface-400'} text-2xs font-semibold`}
    >
      {phase.toUpperCase()}
    </span>
  )
}

function MiniBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const pct = Math.min(value * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-2xs mb-0.5">
        <span className="text-surface-500">{label}</span>
        <span className="text-surface-400 font-mono">{value.toFixed(2)}</span>
      </div>
      <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
