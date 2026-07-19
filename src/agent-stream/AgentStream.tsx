/** AgentStream: 认知渲染层 — 将事件流转换为用户能理解的 Agent 工作过程。
 *
 *  用法:
 *    const messages = useAgentStream()
 *    <AgentStream messages={messages} />
 *
 *  或直接在组件内：
 *    <AgentStreamController />
 */
import { useMemo, useRef, useEffect } from 'react'
import { useStore } from '../stores/runtime'
import { mapEvents } from './mapper'
import { AgentMessage as AgentMessageCard } from './AgentMessage'
import type { AgentMessage, MessageType } from './MessageTypes'

/* ── Hook ───────────────────────────────────────────── */

export function useAgentStream(): AgentMessage[] {
  const events = useStore((s) => s.events)
  // 缓存已映射的消息，避免每次渲染都重新映射
  const prevLenRef = useRef(0)
  const cachedRef = useRef<AgentMessage[]>([])

  return useMemo(() => {
    if (events.length === prevLenRef.current && cachedRef.current.length > 0) {
      return cachedRef.current
    }
    prevLenRef.current = events.length
    const mapped = mapEvents(events)
    // 标记最新消息
    if (mapped.length > 0) {
      mapped[mapped.length - 1] = {
        ...mapped[mapped.length - 1],
        isFresh: cachedRef.current.length > 0,
      }
    }
    cachedRef.current = mapped
    return mapped
  }, [events])
}

/* ── Stream 组件 ────────────────────────────────────── */

interface AgentStreamProps {
  messages: AgentMessage[]
  onSelect?: (type: MessageType, id: string) => void
}

export function AgentStream({ messages, onSelect }: AgentStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex-1 overflow-auto">
      {messages.map((msg, idx) => (
        <AgentMessageCard
          key={msg.id}
          message={msg}
          isLatest={idx === messages.length - 1}
          onSelect={onSelect}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
