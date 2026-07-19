/** Narrative Compressor — 将 AgentMessage[] 压缩为 NarrativeBlock[]。
 *
 *  纯函数，规则驱动，不调用 LLM。
 *  可按顺序叠加多个 grouper：
 *    1. Tool Group    — 连续工具调用折叠
 *    2. Fact Group    — 同类事实聚合
 *    3. Phase Summary — 阶段结束摘要
 */
import type { AgentMessage } from '../agent-stream/MessageTypes'
import type { NarrativeBlock, StreamItem, CompressionOptions } from './types'
import { DEFAULT_OPTIONS } from './types'
import { groupConsecutiveTools } from './groupers/toolGroup'
import { groupConsecutiveFacts } from './groupers/factGroup'
import { buildPhaseSummary, skipPhaseMessages } from './groupers/phaseSummary'

/**
 * 压缩消息数组为工程叙事流。
 * 多次遍历，每次应用一种压缩规则。
 */
export function compress(
  messages: AgentMessage[],
  options: CompressionOptions = DEFAULT_OPTIONS,
): StreamItem[] {
  let items: StreamItem[] = [...messages]

  // Pass 1: Tool Group — 连续工具调用折叠
  if (options.toolGroupThreshold > 0) {
    items = groupConsecutiveTools(items, options.toolGroupThreshold)
  }

  // Pass 2: Fact Group — 同类事实聚合
  if (options.factGroupThreshold > 0) {
    items = groupConsecutiveFacts(items, options.factGroupThreshold)
  }

  // Pass 3: Phase Summary — 阶段摘要
  if (options.enablePhaseSummary) {
    items = insertPhaseSummaries(items)
  }

  return items
}

/* ── Phase Summary 生成 ───────────────────────────── */

function insertPhaseSummaries(items: StreamItem[]): StreamItem[] {
  const result: StreamItem[] = []
  let currentPhase = 'init'
  let phaseStart = 0
  let hasPhaseHeader = false

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // 检测 phase_header
    if ('type' in item && (item as AgentMessage).type === 'phase_header') {
      // 如果之前已有阶段内容，插入摘要
      if (hasPhaseHeader) {
        const phaseMessages = items.slice(phaseStart, i).filter(
          (m): m is AgentMessage => 'kind' in m || 'type' in m,
        )
        if (phaseMessages.length > 0) {
          const summary = buildPhaseSummary(
            currentPhase,
            (item as AgentMessage).data.to as string || currentPhase,
            phaseMessages,
          )
          result.push(summary)
        }
      }

      currentPhase = (item as AgentMessage).data.to as string || currentPhase
      phaseStart = i + 1
      hasPhaseHeader = true
      result.push(item)
      continue
    }

    result.push(item)
  }

  // 最后一段的摘要（如果最后一个 phase_header 之后还有内容）
  if (hasPhaseHeader) {
    const remaining = items.slice(phaseStart)
    const phaseMsgs = remaining.filter(
      (m): m is AgentMessage => 'kind' in m || 'type' in m,
    )
    if (phaseMsgs.length > 0) {
      const summary = buildPhaseSummary(currentPhase, currentPhase, phaseMsgs)
      result.push(summary)
    }
  }

  return result
}

/**
 * 将 NarrativeBlock 展开为原始 AgentMessage 列表。
 * 用于 Inspecto r 联动或详情展示。
 */
export function expandBlock(block: NarrativeBlock): AgentMessage[] {
  return block.children
}
