/** Center workspace: 聊天流模式 — 消息按时间顺序排列，新消息自动滚动到底部。 */
import { useStore } from '../stores/runtime'
import { ChatStream } from '../agent-stream/ChatStream'
import { UserInput } from './UserInput'

interface CenterWorkspaceProps {
  onSend: (message: string, mode: string) => void
}

export function CenterWorkspace({ onSend }: CenterWorkspaceProps) {
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)
  const hasContent = events.length > 0

  const activeTask = tasks.find((t) => t.isRunning)

  /* ── Welcome empty state ────────────────────────────── */
  if (!hasContent) {
    return (
      <div className="flex-1 flex flex-col bg-surface-950">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md px-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-600/10 border border-accent-500/20 flex items-center justify-center">
              <span className="text-3xl">⚡</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-surface-200 mb-1">ForgeX 工作室</h2>
              <p className="text-sm text-surface-500">AI 工程自主操作系统</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-surface-500">输入任务开始，或试试以下示例：</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['分析项目架构', '优化性能瓶颈', '生成测试报告', '重构核心模块'].map((s) => (
                  <button key={s}
                    className="px-3 py-1.5 text-xs text-surface-400 bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 rounded-lg transition-colors"
                    onClick={() => onSend(s, 'auto')}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <UserInput onSend={onSend} />
      </div>
    )
  }

  /* ── Chat view with header + stream + input ─────────── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900/30 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-surface-300">对话</span>
          <span className="text-2xs text-surface-600">{events.length} 事件</span>
        </div>
        {activeTask && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-2xs text-surface-500">运行中</span>
          </div>
        )}
      </div>

      {/* Chat stream — scrollable, newest at bottom */}
      <ChatStream />

      {/* Input always at bottom */}
      <UserInput onSend={onSend} />
    </div>
  )
}
