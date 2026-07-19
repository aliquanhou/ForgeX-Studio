/** ChatStream: 纯聊天流模式 — 消息按时间顺序从上到下排列，新消息自动滚动到底部。 */
import { useMemo, useRef, useEffect } from 'react'
import { useStore } from '../stores/runtime'
import type { ForgeEvent } from '../stores/runtime'
import type { AgentMessage, MessageType } from './MessageTypes'

/* ── Hook: 将事件流转换为聊天消息 ──────────────────────── */

interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'system' | 'tool'
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export function useChatMessages(): ChatMessage[] {
  const events = useStore((s) => s.events)

  return useMemo(() => {
    const msgs: ChatMessage[] = []
    let pendingTool: ForgeEvent | null = null

    for (const ev of events) {
      switch (ev.kind) {
        case 'user_message':
          msgs.push({
            id: ev.event_id,
            role: 'user',
            content: (ev.payload.message as string) || '',
            timestamp: ev.timestamp,
            metadata: { mode: ev.payload.mode as string },
          })
          break

        case 'fact_confirmed': {
          const fact = (ev.payload.fact as string) || ''
          const isFinal = ev.payload.is_final as boolean
          const source = (ev.payload.source as string) || ''
          const isStreaming = ev.payload.is_streaming as boolean
          if (isFinal || source === 'llm') {
            if (isStreaming && msgs.length > 0 && msgs[msgs.length - 1].role === 'agent') {
              // Streaming chunk — replace last agent message (immutable update)
              const last = msgs[msgs.length - 1]
              msgs[msgs.length - 1] = { ...last, content: fact, timestamp: ev.timestamp }
            } else {
              // Final response or first chunk — push new agent message
              msgs.push({
                id: ev.event_id,
                role: 'agent',
                content: fact,
                timestamp: ev.timestamp,
                metadata: { confidence: ev.payload.confidence as number },
              })
            }
          } else {
            // Intermediate fact — show as compact system note
            msgs.push({
              id: ev.event_id,
              role: 'system',
              content: fact,
              timestamp: ev.timestamp,
              metadata: { source, confidence: ev.payload.confidence as number },
            })
          }
          break
        }

        case 'tool_started': {
          const tool = (ev.payload.tool as string) || ''
          const displayName = (ev.payload.display_name as string) || tool
          pendingTool = ev
          msgs.push({
            id: ev.event_id,
            role: 'tool',
            content: `${displayName} ${(ev.payload.target as string) || ''}`,
            timestamp: ev.timestamp,
            metadata: { status: 'running', tool },
          })
          break
        }

        case 'tool_completed': {
          if (pendingTool) {
            // Update the last running tool message (backward search for ES2020 compat)
            for (let i = msgs.length - 1; i >= 0; i--) {
              const m = msgs[i]
              if (m.role === 'tool' && m.metadata?.status === 'running') {
                const duration = ev.payload.duration_ms as number
                m.metadata = {
                  ...m.metadata,
                  status: 'completed',
                  duration_ms: duration,
                  result: (ev.payload.result_summary as string) || '',
                }
                break
              }
            }
            pendingTool = null
          }
          break
        }

        case 'intent_classified':
          msgs.push({
            id: ev.event_id,
            role: 'system',
            content: `意图: ${(ev.payload.intent as string) || ''} (置信度: ${(((ev.payload.confidence as number) || 0) * 100).toFixed(0)}%)`,
            timestamp: ev.timestamp,
          })
          break

        case 'phase_changed': {
          const to = (ev.payload.to as string) || ''
          const phaseLabels: Record<string, string> = {
            planning: '规划阶段',
            exploration: '分析阶段',
            implementation: '执行阶段',
            verification: '验证阶段',
            finalizing: '收尾阶段',
            completed: '已完成',
          }
          msgs.push({
            id: ev.event_id,
            role: 'system',
            content: `→ ${phaseLabels[to] || to}`,
            timestamp: ev.timestamp,
          })
          break
        }

        case 'task_completed': {
          const rounds = ev.payload.rounds as number
          const tokens = ev.payload.tokens_used as number
          const elapsed = ev.payload.elapsed_seconds as number
          msgs.push({
            id: ev.event_id,
            role: 'system',
            content: `任务完成 · ${rounds} 轮 · ${tokens} token · ${elapsed.toFixed(1)}s`,
            timestamp: ev.timestamp,
          })
          break
        }

        case 'error':
          msgs.push({
            id: ev.event_id,
            role: 'system',
            content: `错误: ${(ev.payload.error as string) || '未知错误'}`,
            timestamp: ev.timestamp,
          })
          break
      }
    }

    return msgs
  }, [events])
}

/* ── ChatStream 组件 ──────────────────────────────────── */

export function ChatStream() {
  const messages = useChatMessages()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  if (messages.length === 0) return null

  return (
    <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

/* ── ChatBubble 组件 ──────────────────────────────────── */

function ChatBubble({ message }: { message: ChatMessage }) {
  switch (message.role) {
    case 'user':
      return (
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-accent-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      )

    case 'agent':
      return (
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-surface-800 border border-surface-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-accent-400">ForgeX</span>
              {message.metadata?.confidence && (
                <span className="text-2xs text-surface-500">
                  {((message.metadata.confidence as number) * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <div className="text-sm text-surface-100 leading-relaxed whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>
      )

    case 'tool': {
      const status = (message.metadata?.status as string) || ''
      const duration = message.metadata?.duration_ms as number | undefined
      const result = (message.metadata?.result as string) || ''
      return (
        <div className="flex justify-start pl-4">
          <div className={`text-xs border rounded-lg px-3 py-1.5 ${
            status === 'running'
              ? 'bg-warning/5 border-warning/20 text-warning'
              : 'bg-surface-900/50 border-surface-800 text-surface-400'
          }`}>
            <div className="flex items-center gap-2">
              <span>{message.content}</span>
              {status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />}
              {duration !== undefined && <span className="text-2xs">{duration.toFixed(0)}ms</span>}
            </div>
            {result && <div className="text-2xs text-surface-500 mt-0.5">{result}</div>}
          </div>
        </div>
      )
    }

    case 'system':
    default:
      return (
        <div className="flex justify-center">
          <div className="text-2xs text-surface-500 bg-surface-900/50 px-3 py-1 rounded-full">
            {message.content}
          </div>
        </div>
      )
  }
}
