/** AgentMessage: 单条思考消息的通用包装。
 *  负责布局、时间戳、状态指示；内容由 EventRenderer 按 type 分发。
 */
import type { AgentMessageProps } from './MessageTypes'
import { EventRenderer } from './EventRenderer'

export function AgentMessage({ message, isLatest, onSelect }: AgentMessageProps) {
  const ts = new Date(message.timestamp)
  const time = `${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')}`

  // Phase header 使用特殊布局
  if (message.type === 'phase_header') {
    return <EventRenderer message={message} />
  }

  return (
    <div
      className={`px-4 py-2.5 border-b border-surface-800 last:border-0 transition-colors
        ${isLatest ? 'bg-accent-500/[0.02]' : ''}
        ${message.status === 'running' ? 'bg-success/[0.02]' : ''}
        ${message.status === 'failed' ? 'bg-error/[0.03]' : ''}
        ${message.status === 'pending' ? 'bg-warning/[0.03]' : ''}`}
    >
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
            </span>
            <span className="text-2xs text-surface-600">{time}</span>
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
  // 根据类型选图标
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
