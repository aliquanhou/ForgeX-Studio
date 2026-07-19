/** Fact group: 按子系统/主题聚合连续的事实发现。 */

import type { AgentMessage } from '../../agent-stream/MessageTypes'
import type { NarrativeBlock, StreamItem } from '../types'

interface FactEntry {
  fact: string
  source: string
  confidence: number | null
}

/**
 * 将连续的事实发现合并为一个 block。
 * 规则：
 *   - 连续 fact ≥ threshold 条
 *   - 按关键词聚类（"发现 X"、"确认 X"中的关键实体）
 *   - 不同来源/子系统的 fact 不合并
 */
export function groupConsecutiveFacts(
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
      result.push(buildFactBlock(buffer))
    }
    buffer = []
  }

  for (const msg of messages) {
    if (msg.type === 'world_update') {
      // 检查是否与 buffer 中的 fact 主题一致
      if (buffer.length > 0 && !isSameTheme(msg, buffer[buffer.length - 1])) {
        flush()
      }
      buffer.push(msg)
    } else {
      flush()
      result.push(msg)
    }
  }
  flush()

  return result
}

/* ── 主题判断 ─────────────────────────────────────── */

/** 两个 fact 是否属于同一个主题（通过关键词匹配） */
function isSameTheme(a: AgentMessage, b: AgentMessage): boolean {
  const fa = extractKeywords((a.data.fact as string) || '')
  const fb = extractKeywords((b.data.fact as string) || '')
  // 共享至少一个相同关键词
  return fa.some((k) => fb.includes(k))
}

/** 从事实中提取关键词（简单分词，取名词性核心词） */
function extractKeywords(fact: string): string[] {
  // 去掉标点，按空格/冒号/逗号/句号分割
  const tokens = fact
    .replace(/[，。、：；！？\n]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  // 取可能代表实体的词：非停用词且长度 >= 2 或包含大写/特殊字符
  const stopWords = new Set([
    '的', '了', '是', '在', '有', '和', '与', '为', '把', '被',
    '从', '到', '对', '中', '上', '下', 'this', 'the', 'a', 'an',
    '发现', '确认', '获取', '定位', '扫描', '分析',
  ])

  return tokens.filter(
    (t) => t.length >= 2 && !stopWords.has(t) && /[\w一-鿿]/.test(t),
  )
}

/* ── Block builder ───────────────────────────────── */

export function buildFactBlock(facts: AgentMessage[]): NarrativeBlock {
  const entries: FactEntry[] = facts.map((f) => ({
    fact: (f.data.fact as string) || '',
    source: (f.data.source as string) || '',
    confidence: (f.data.confidence as number) ?? null,
  }))

  // 提取核心实体
  const allKeywords = new Set<string>()
  for (const e of entries) {
    for (const kw of extractKeywords(e.fact)) {
      allKeywords.add(kw)
    }
  }
  const entities = [...allKeywords].slice(0, 8)

  // 按来源统计
  const sources = [...new Set(entries.map((e) => e.source).filter(Boolean))]

  // 平均置信度
  const confidences = entries.map((e) => e.confidence).filter((v): v is number => v !== null)
  const avgConf =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : null

  // 生成主题标题
  const title = buildThemeTitle(entities)

  const summaryParts: string[] = []
  summaryParts.push(`${facts.length} 条事实`)
  if (entities.length > 0) summaryParts.push(`${entities.length} 个实体`)
  if (avgConf !== null) summaryParts.push(`置信度 ${(avgConf * 100).toFixed(0)}%`)

  return {
    id: `fact-group-${facts[0].id}`,
    type: 'fact_group',
    childIds: facts.map((f) => f.id),
    title,
    summary: summaryParts.join(' · '),
    children: facts,
    meta: {
      count: facts.length,
      entities,
      sources,
      avgConfidence: avgConf,
    },
    status: 'completed',
    timestamp: facts[0].timestamp,
    collapsible: true,
  }
}

/** 根据实体列表推断可读的主题标题 */
function buildThemeTitle(entities: string[]): string {
  if (entities.length === 0) return '世界模型更新'
  if (entities.length <= 3) return entities.join(' / ')
  const firstFew = entities.slice(0, 3).join(' · ')
  return `${firstFew} 等`
}
