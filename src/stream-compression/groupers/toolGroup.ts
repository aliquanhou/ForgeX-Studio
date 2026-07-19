/** Tool group: 合并连续的同类工具调用。 */

import type { AgentMessage } from '../../agent-stream/MessageTypes'
import type { NarrativeBlock, StreamItem } from '../types'

/** 单次工具调用摘要 */
interface ToolEntry {
  tool: string
  target: string
  result: string
  duration: number | null
  eviScore: number | null
}

/**
 * 将连续的工具调用合并为一个 block。
 * 规则：
 *   - 同类型工具连续出现 ≥ threshold 条
 *   - 或者不同工具但连续调用 ≥ threshold 条
 *   - 跳过正在 running 的工具
 */
export function groupConsecutiveTools(
  messages: StreamItem[],
  threshold: number,
): StreamItem[] {
  const result: (AgentMessage | NarrativeBlock)[] = []
  let buffer: AgentMessage[] = []

  function flush() {
    if (buffer.length === 0) return
    if (buffer.length < threshold) {
      result.push(...buffer)
    } else {
      result.push(buildToolBlock(buffer))
    }
    buffer = []
  }

  for (const msg of messages) {
    if (
      msg.type === 'tool' &&
      msg.status !== 'running'
    ) {
      buffer.push(msg)
    } else {
      flush()
      result.push(msg)
    }
  }
  flush()

  return result
}

/* ── Block builder ───────────────────────────────── */

export function buildToolBlock(tools: AgentMessage[]): NarrativeBlock {
  const entries = tools.map((t) => ({
    tool: (t.data.tool as string) || '',
    target: (t.data.target as string) || '',
    result: (t.data.result_summary as string) || '',
    duration: (t.data.duration_ms as number) ?? null,
    eviScore: (t.data.evi_score as number) ?? null,
  }))

  // 常见工具名 → 中文描述
  const toolFreq: Record<string, number> = {}
  for (const e of entries) {
    const name = e.tool || 'unknown'
    toolFreq[name] = (toolFreq[name] || 0) + 1
  }
  const topTool = Object.entries(toolFreq).sort((a, b) => b[1] - a[1])[0]

  // 去重目标文件（取目录前缀判断"模块"）
  const targets = [...new Set(entries.map((e) => e.target).filter(Boolean))]
  const eviValues = entries.map((e) => e.eviScore).filter((v): v is number => v !== null)
  const avgEvi = eviValues.length > 0
    ? eviValues.reduce((a, b) => a + b, 0) / eviValues.length
    : null

  // 生成可读标题
  let title = ''
  if (topTool && targets.length <= 1) {
    title = `${topTool[0]} · ${targets[0] || ''}`
  } else if (targets.length <= 3) {
    title = targets.join(' · ')
  } else {
    // 取共同前缀作为模块名
    title = `扫描 ${detectModule(targets)}`
  }

  // 结果摘要
  const results = entries.filter((e) => e.result).map((e) => e.result)
  const summaryParts: string[] = []
  if (topTool) summaryParts.push(`${topTool[1]} 次 ${topTool[0]}`)
  if (targets.length > 0) summaryParts.push(`${targets.length} 个文件`)
  if (avgEvi !== null) summaryParts.push(`平均 EVI ${avgEvi.toFixed(2)}`)

  return {
    id: `tool-group-${tools[0].id}`,
    type: 'tool_group',
    childIds: tools.map((t) => t.id),
    title,
    summary: summaryParts.join(' · '),
    children: tools,
    meta: {
      count: tools.length,
      topTool: topTool?.[0] || '',
      toolFreq,
      targets,
      avgEvi,
      totalDuration: entries.reduce((s, e) => s + (e.duration || 0), 0),
    },
    status: tools.every((t) => t.status === 'completed') ? 'completed' : 'failed',
    timestamp: tools[0].timestamp,
    collapsible: true,
  }
}

/* ── Helper ────────────────────────────────────────── */

function detectModule(targets: string[]): string {
  // 取最长公共前缀中的有效目录名
  if (targets.length === 0) return ''
  const sorted = [...targets].sort()
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  let i = 0
  while (i < first.length && first[i] === last[i]) i++
  const common = first.slice(0, i)
  // 取最后一个 / 后的内容作为模块名
  const parts = common.split('/')
  if (parts.length >= 2 && parts[parts.length - 2]) {
    return parts[parts.length - 2]
  }
  if (parts.length >= 1 && parts[parts.length - 1]) {
    return parts[parts.length - 1] + '/'
  }
  return `${targets.length} 个模块`
}
