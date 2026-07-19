/** Center workspace: agent activity stream with welcome empty state. */
import { useEffect, useRef } from 'react'
import { useStore } from '../stores/runtime'
import { ActivityCard } from '../stream/ActivityCard'

export function CenterWorkspace() {
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events.length])

  const visible = events.slice(-100)
  const activeTask = tasks.find((t) => t.isRunning)

  /* ── Welcome empty state ────────────────────────────── */
  if (events.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-950">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-600/10 border border-accent-500/20 flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-surface-200 mb-1">
              ForgeX Studio
            </h2>
            <p className="text-sm text-surface-500">AI Engineering Command Center</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-surface-500">输入任务开始，或试试以下示例：</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['分析项目架构', '优化性能瓶颈', '生成测试报告', '重构核心模块'].map(
                (s) => (
                  <button
                    key={s}
                    className="px-3 py-1.5 text-xs text-surface-400 bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 rounded-lg transition-colors"
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-2xs text-surface-700">
            <span>⌘K 命令面板</span>
            <span>⌘↵ 发送</span>
            <span>Tab 切换面板</span>
          </div>
        </div>
      </div>
    )
  }

  /* ── Stream view ────────────────────────────────────── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900/30 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-surface-300">
            Agent Workspace
          </span>
          <span className="text-2xs text-surface-600">
            {visible.length} events
          </span>
        </div>
        {activeTask && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-2xs text-surface-500">Running</span>
          </div>
        )}
      </div>

      {/* Event feed */}
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
