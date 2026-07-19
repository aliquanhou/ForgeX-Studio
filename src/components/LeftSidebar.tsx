/** Left sidebar: project resources, task history, plugins. */
import { useState } from 'react'
import { useStore } from '../stores/runtime'
import {
  FolderOpen,
  History,
  Puzzle,
  ChevronRight,
  ChevronDown,
  FileCode,
} from 'lucide-react'

interface LeftSidebarProps {
  collapsed: boolean
}

export function LeftSidebar({ collapsed }: LeftSidebarProps) {
  const tasks = useStore((s) => s.tasks)
  const selectedTaskId = useStore((s) => s.selectedTaskId)
  const setSelectedTask = useStore((s) => s.setSelectedTask)

  const [sections, setSections] = useState<Record<string, boolean>>({
    project: true,
    tasks: true,
    plugins: false,
  })

  const toggle = (key: string) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))

  if (collapsed) return null

  return (
    <aside className="w-56 bg-surface-950 border-r border-surface-800 flex flex-col overflow-hidden shrink-0">
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {/* ── 项目 ────────────────────────────────── */}
        <SectionHeader
          icon={<FolderOpen className="w-3.5 h-3.5" />}
          label="项目"
          open={sections.project}
          onToggle={() => toggle('project')}
        />
        {sections.project && (
          <div className="ml-1 space-y-0.5">
            <FileRow icon={<FileCode className="w-3.5 h-3.5 text-accent-400" />} label="forge-studio" selected />
            <FileRow indent label="src/" />
            <FileRow indent label="src/components/" />
            <FileRow indent label="src/panels/" />
            <FileRow indent label="package.json" />
          </div>
        )}

        {/* ── 任务历史 ─────────────────────────────── */}
        <SectionHeader
          icon={<History className="w-3.5 h-3.5" />}
          label="任务历史"
          open={sections.tasks}
          onToggle={() => toggle('tasks')}
        />
        {sections.tasks && (
          <div className="ml-1 space-y-0.5">
            {tasks.length === 0 ? (
              <div className="text-2xs text-surface-600 px-2 py-2">暂无任务</div>
            ) : (
              tasks
                .slice(-10)
                .reverse()
                .map((task) => (
                  <button
                    key={task.taskId}
                    onClick={() => setSelectedTask(task.taskId)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left ${
                      selectedTaskId === task.taskId
                        ? 'bg-accent-600/15 text-accent-400'
                        : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        task.isRunning
                          ? 'bg-success animate-pulse'
                          : task.success === true
                            ? 'bg-success'
                            : task.success === false
                              ? 'bg-error'
                              : 'bg-surface-600'
                      }`}
                    />
                    <span className="truncate">{task.goal}</span>
                  </button>
                ))
            )}
          </div>
        )}

        {/* ── 插件 ────────────────────────────────── */}
        <SectionHeader
          icon={<Puzzle className="w-3.5 h-3.5" />}
          label="插件"
          open={sections.plugins}
          onToggle={() => toggle('plugins')}
        />
        {sections.plugins && (
          <div className="ml-1 space-y-0.5">
            <FileRow icon={<StatusDot color="bg-success" />} label="Python Analyzer v1.0" />
            <FileRow icon={<StatusDot color="bg-success" />} label="Git Tools v1.0" />
          </div>
        )}
      </div>

      {/* ── Bottom status ─────────────────────────── */}
      <div className="px-3 py-2 border-t border-surface-800 text-2xs text-surface-600">
        Runtime v0.5 · 离线模式
      </div>
    </aside>
  )
}

/* ── Sub-components ───────────────────────────────────── */

function SectionHeader({
  icon,
  label,
  open,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 transition-colors"
    >
      {open ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
      {icon}
      <span>{label}</span>
    </button>
  )
}

function FileRow({
  icon,
  label,
  indent,
  selected,
}: {
  icon?: React.ReactNode
  label: string
  indent?: boolean
  selected?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${
        selected
          ? 'text-accent-400 bg-accent-600/10'
          : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
      } ${indent ? 'ml-5' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function StatusDot({ color }: { color: string }) {
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
}
