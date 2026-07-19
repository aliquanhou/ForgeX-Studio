/** AgentMessage: 单条思考消息的通用包装。
 *  负责布局、时间戳、状态指示；内容由 EventRenderer 按 type 分发。
 *  可点击的卡片（tool/decision/world_update）自动连接到 Inspector。
 */
import { useInspectorStore } from '../stores/inspector'
import type { AgentMessageProps } from './MessageTypes'
import { EventRenderer } from './EventRenderer'

export function AgentMessage({ message, isLatest, onSelect }: AgentMessageProps) {
  const ts = new Date(message.timestamp)
  const time = `${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')}`

  // 检查是否被 Inspector 选中
  const selectedId = useInspectorStore((s) => s.selectedMessageId)
  const isSelected = selectedId === message.id

  // Phase header 使用特殊布局
  if (message.type === 'phase_header') {
    return <EventRenderer message={message} />
  }

  // 可点击的卡片类型（点击可打开 Inspector）
  const isClickable = ['tool', 'decision', 'world_update'].includes(message.type)

  return (
    <div
      className={`px-4 py-2.5 border-b border-surface-800 last:border-0 transition-colors relative
        ${isSelected ? 'bg-accent-500/[0.06]' : ''}
        ${!isSelected && isLatest ? 'bg-accent-500/[0.02]' : ''}
        ${message.status === 'running' ? 'bg-success/[0.02]' : ''}
        ${message.status === 'failed' ? 'bg-error/[0.03]' : ''}
        ${message.status === 'pending' ? 'bg-warning/[0.03]' : ''}
        ${isClickable ? 'cursor-pointer hover:bg-surface-800/30' : ''}`}
      onClick={
        isClickable && onSelect
          ? () => onSelect(message.type as 'tool' | 'decision' | 'world_update', message.id)
          : undefined
      }
    >
      {/* 选中高亮边条 */}
      <SelectedBar isSelected={isSelected} />

      <div className="flex items-start gap-3">
        {/* 状态指示器 */}
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <StatusIcon status={message.status} type={message.type} />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-surface-400">
              <TypeLabel type={message.type} />
              {isClickable && <span className="text-2xs text-surface-600 ml-1">↗</span>}
            </span>
            <span className="text-2xs text-surface-600">{time}</span>
            {isSelected && (
              <span className="px-1 py-0.5 text-2xs font-medium text-accent-400 bg-accent-500/15 rounded">选中</span>
            )}
            {message.status === 'running' && (
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            )}
          </div>
          <EventRenderer message={message} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}

/* ── 子组件 ───────────────────────────────────────────── */

function SelectedBar({ isSelected }: { isSelected: boolean }) {
  if (!isSelected) return null
  return (
    <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-accent-400 rounded-full shadow-[0_0_4px_rgba(99,102,241,0.5)]" />
  )
}

function StatusIcon({ status, type }: { status: string; type: string }) {
  if (status === 'running') {
    return (
      <svg className="w-3 h-3 text-success animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }
  if (status === 'pending') {
    return <span className="text-xs text-warning">⏳</span>
  }
  if (status === 'failed') {
    return <span className="text-xs text-error">✗</span>
  }
  const icons: Record<string, string> = {
    user_message: '💬',
    intent: '🧠',
    plan: '📋',
    thought: '💭',
    decision: '⚡',
    tool: '🔧',
    world_update: '🌎',
    artifact: '📄',
    completion: '✅',
    error: '⚠',
  }
  return <span className="text-xs">{icons[type] || '·'}</span>
}

function TypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    user_message: '你',
    intent: '意图识别',
    plan: '计划',
    thought: '思考',
    decision: '决策',
    tool: '工具调用',
    world_update: '世界模型',
    artifact: '制品',
    completion: '完成',
    error: '错误',
  }
  return labels[type] || type
}
