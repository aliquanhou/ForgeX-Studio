/** Center workspace: Agent 认知渲染层。
 *  把 Runtime 事件流 → 转换成用户能理解的 Agent 工作过程。
 */
import { useCallback } from 'react'
import { useStore } from '../stores/runtime'
import { useInspectorStore } from '../stores/inspector'
import { AgentStream, useAgentStream } from '../agent-stream/AgentStream'
import type { AgentMessage, MessageType } from '../agent-stream/MessageTypes'

export function CenterWorkspace() {
  const messages = useAgentStream()
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)
  const openInspector = useInspectorStore((s) => s.openInspector)

  const activeTask = tasks.find((t) => t.isRunning)

  /** 卡片点击 → 打开 Inspector 对应标签 */
  const handleSelect = useCallback(
    (type: MessageType, id: string) => {
      // 从消息列表里找完整 payload
      const msg = messages.find((m) => m.id === id)
      if (!msg) return

      const tabMap: Partial<Record<MessageType, 'task' | 'decision' | 'world' | 'memory' | 'tools' | 'plugins'>> = {
        tool: 'tools',
        decision: 'decision',
        world_update: 'world',
        artifact: 'world',
        intent: 'decision',
        plan: 'task',
        completion: 'task',
      }

      openInspector({
        type,
        id,
        payload: msg.data,
        tab: tabMap[type] || 'task',
      })
    },
    [messages, openInspector],
  )

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

  /* ── Agent Stream ───────────────────────────────────── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900/30 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-surface-300">Agent Workspace</span>
          <span className="text-2xs text-surface-600">{messages.length} 条消息</span>
        </div>
        {activeTask && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-2xs text-surface-500">Running</span>
          </div>
        )}
      </div>

      {/* Agent thought stream */}
      <AgentStream messages={messages} onSelect={handleSelect} />
    </div>
  )
}
