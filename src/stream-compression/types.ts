/** Narrative Compression — 压缩后的工程叙事块类型定义。 */
import type { AgentMessage, MessageType, MessageStatus } from '../agent-stream/MessageTypes'

/* ── Stream item (compress 后的流项目) ─────────────── */

export type StreamItem = AgentMessage | NarrativeBlock

/* ── Block types ────────────────────────────────────── */

export type BlockType =
  | 'single'        // 未压缩的单条消息
  | 'tool_group'    // 连续工具调用合并
  | 'fact_group'    // 同类事实聚合
  | 'phase_summary' // 阶段结束摘要

export interface NarrativeBlock {
  id: string
  type: BlockType
  /** 用于 Inspector 联动的原始消息 ID（single / phase_summary 有效） */
  sourceId?: string
  /** 包含的原始消息 ID 列表（用于 group blocks） */
  childIds: string[]
  /** 块标题 */
  title: string
  /** 缩略描述（折叠状态下显示） */
  summary: string
  /** 原始消息列表（展开时显示，或发送到 Inspector） */
  children: AgentMessage[]
  /** 计算得出的聚合数据 */
  meta: Record<string, unknown>
  /** 块状态（从 children 推导） */
  status: MessageStatus
  /** 时间戳（取第一个 child） */
  timestamp: string
  /** 消息类型（single 时原值，group 时取 group 类型） */
  messageType?: MessageType
  /** 是否默认折叠 */
  collapsible: boolean
}

/* ── Compressor 选项 ──────────────────────────────── */

export interface CompressionOptions {
  /** 连续多少个 tool 开始折叠（默认 3） */
  toolGroupThreshold: number
  /** 连续多少个 fact 开始折叠（默认 3） */
  factGroupThreshold: number
  /** 是否生成阶段摘要（默认 true） */
  enablePhaseSummary: boolean
}

export const DEFAULT_OPTIONS: CompressionOptions = {
  toolGroupThreshold: 3,
  factGroupThreshold: 3,
  enablePhaseSummary: true,
}
