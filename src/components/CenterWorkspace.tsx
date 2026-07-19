/** Center workspace: Agent 认知渲染层 + User Input.
 *  瀑布流展示 Agent 工作过程，底部对齐输入栏。
 */
import { useCallback } from 'react'
import { useStore } from '../stores/runtime'
import { useInspectorStore } from '../stores/inspector'
import { AgentStream, useCompressedStream } from '../agent-stream/AgentStream'
import { UserInput } from './UserInput'
import type { AgentMessage, MessageType } from '../agent-stream/MessageTypes'
import type { NarrativeBlock } from '../stream-compression/types'

interface CenterWorkspaceProps {
  onSend: (message: string, mode: string) => void
}

export function CenterWorkspace({ onSend }: CenterWorkspaceProps) {
  const items = useCompressedStream()
  const events = useStore((s) => s.events)
  const tasks = useStore((s) => s.tasks)
  const openInspector = useInspectorStore((s) => s.openInspector)

  const activeTask = tasks.find((t) => t.isRunning)
  const hasContent = events.length > 0

  const handleSelect = useCallback(
    (type: string, id: string) => {
      const item = items.find((m) => m.id === id)
      if (!item) return

      if ('childIds' in item) {
        const block = item as NarrativeBlock
        const tabMap: Record<string, 'task' | 'decision' | 'world' | 'tools'> = {
          tool_group: 'tools',
          fact_group: 'world',
          phase_summary: 'task',
        }
        openInspector({
          type: type as any, id,
          payload: block.meta,
          tab: tabMap[block.type] || 'task',
        })
      } else {
        const msg = item as AgentMessage
        const tabMap: Record<string, 'task' | 'decision' | 'world' | 'tools'> = {
          tool: 'tools',
          decision: 'decision',
          world_update: 'world',
          artifact: 'world',
          intent: 'decision',
          plan: 'task',
          completion: 'task',
        }
        openInspector({
          type: type as any, id,
          payload: msg.data,
          tab: tabMap[msg.type] || 'task',
        })
      }
    },
    [items, openInspector],
  )

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
              <h2 className="text-lg font-semibold text-surface-200 mb-1">ForgeX Studio</h2>
              <p className="text-sm text-surface-500">AI Engineering Command Center</p>
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
            <div className="flex items-center gap-4 text-2xs text-surface-700">
              <span>Cmd+K 命令面板</span>
              <span>Cmd+Enter 发送</span>
              <span>Tab 切换面板</span>
            </div>
          </div>
        </div>
        <UserInput onSend={onSend} />
      </div>
    )
  }

  /* ── Agent Stream + UserInput ───────────────────────── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900/30 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-surface-300">Agent Workspace</span>
          <span className="text-2xs text-surface-600">
            {items.length} 叙事节点
            <span className="text-surface-700 ml-1">(原始 {events.length} 事件)</span>
          </span>
        </div>
        {activeTask && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-2xs text-surface-500">运行中</span>
          </div>
        )}
      </div>

      {/* Waterfall stream — fills remaining space */}
      <AgentStream items={items} onSelect={handleSelect} />

      {/* User input — only in center column */}
      <UserInput onSend={onSend} />
    </div>
  )
}
