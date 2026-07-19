/** AgentStream: 认知渲染层 — 将事件流转换为用户能理解的 Agent 工作过程。
 *
 *  支持 Narrative Compression: StreamItem 可以是 AgentMessage 或 NarrativeBlock。
 */
import { useMemo, useRef, useEffect } from 'react'
import { useStore } from '../stores/runtime'
import { mapEvents } from './mapper'
import { compress } from '../stream-compression/compressor'
import { NarrativeRenderer } from '../stream-compression/NarrativeRenderer'
import type { AgentMessage, MessageType } from './MessageTypes'
import type { NarrativeBlock } from '../stream-compression/types'
import type { StreamItem } from '../stream-compression/types'

/* ── Hook ───────────────────────────────────────────── */

export function useCompressedStream(): StreamItem[] {
  const events = useStore((s) => s.events)
  const prevLenRef = useRef(0)
  const cachedRef = useRef<StreamItem[]>([])

  return useMemo(() => {
    if (events.length === prevLenRef.current && cachedRef.current.length > 0) {
      return cachedRef.current
    }
    prevLenRef.current = events.length

    // 1. 映射为 AgentMessage
    const messages: AgentMessage[] = mapEvents(events)

    // 2. 标记最新消息
    if (messages.length > 0) {
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        isFresh: cachedRef.current.length > 0,
      }
    }

    // 3. 压缩为叙事流
    const compressed = compress(messages)

    cachedRef.current = compressed
    return compressed
  }, [events])
}

export { type StreamItem }

/* ── Stream 组件 ────────────────────────────────────── */

interface AgentStreamProps {
  items: StreamItem[]
  onSelect?: (type: string, id: string) => void
}

export function AgentStream({ items, onSelect }: AgentStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items.length])

  return (
    <div className="flex-1 overflow-auto">
      {items.map((item, idx) => {
        const id = ('id' in item ? String((item as any).id) : 'sourceId' in item ? String((item as any).id) : String(idx))
        return (
          <NarrativeRenderer
            key={id}
            item={item}
            isLatest={idx === items.length - 1}
            onSelect={onSelect}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
