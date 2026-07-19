/** Top bar: project/task navigation, runtime status, settings.
 *  v0.3.3: includes ControlBar when task is active.
 */
import { useStore } from '../stores/runtime'
import { Settings, ChevronDown } from 'lucide-react'
import { ControlBar } from './ControlBar'

interface TopBarProps {
  leftOpen: boolean
  rightOpen: boolean
  onToggleLeft: () => void
  onToggleRight: () => void
}

export function TopBar({ leftOpen, rightOpen, onToggleLeft, onToggleRight }: TopBarProps) {
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)
  const mode = useStore((s) => s.mode)
  const paused = useStore((s) => s.paused)
  const humanOverride = useStore((s) => s.humanOverride)

  const activeTasks = tasks.filter((t) => t.isRunning).length
  const hasControl = paused || humanOverride

  const modeLabel: Record<string, string> = {
    autonomous: '🟢 自主',
    observe: '🟡 观察',
    governed: '🔴 治理',
  }

  return (
    <header className="shrink-0 bg-surface-900 border-b border-surface-800 select-none">
      {/* ── Title row ──────────────────────────────── */}
      <div className="flex items-center justify-between px-3 h-10">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLeft}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
              leftOpen
                ? 'bg-accent-600/20 text-accent-400'
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'
            }`}
            title={leftOpen ? '收起侧栏' : '展开侧栏'}
          >
            <SidebarIcon />
          </button>

          <div className="w-5 h-5 rounded bg-accent-600 flex items-center justify-center text-[10px] font-bold text-white">
            F
          </div>
          <span className="text-sm font-semibold text-surface-100">ForgeX 工作室</span>
          <span className="text-2xs text-surface-500">v0.3</span>

          <div className="h-4 w-px bg-surface-700 mx-1" />

          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1 px-2 py-1 text-2xs text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-800 rounded transition-colors">
              项目 <ChevronDown className="w-2.5 h-2.5" />
            </button>
            <button className="flex items-center gap-1 px-2 py-1 text-2xs text-surface-400 hover:text-surface-200 bg-surface-800/50 hover:bg-surface-800 rounded transition-colors">
              任务 <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-3">
          {/* Runtime status */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                events.length > 0
                  ? hasControl
                    ? 'bg-warning animate-pulse shadow-[0_0_4px_rgba(245,158,11,0.5)]'
                    : 'bg-success animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.5)]'
                  : 'bg-surface-600'
              }`}
            />
            <span className="text-2xs text-surface-500">
              {humanOverride ? '接管' : paused ? '暂停' : events.length > 0 ? '活跃' : '空闲'}
            </span>
          </div>

          {/* Mode badge */}
          {events.length > 0 && (
            <span className="text-2xs text-surface-500">{modeLabel[mode] || mode}</span>
          )}

          {activeTasks > 0 && (
            <span className="text-2xs text-surface-500">{activeTasks} 个运行中</span>
          )}

          <div className="h-4 w-px bg-surface-700" />

          <button
            onClick={onToggleRight}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
              rightOpen
                ? 'bg-accent-600/20 text-accent-400'
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'
            }`}
            title={rightOpen ? 'Close inspector' : 'Open inspector'}
          >
            <InspectorIcon />
          </button>

          <button
            className="w-7 h-7 rounded flex items-center justify-center text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Control bar row ───────────────────────── */}
      <ControlBar />
    </header>
  )
}

function SidebarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  )
}

function InspectorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  )
}
