/** Phase summary: 阶段结束时的自动摘要块。 */

import type { AgentMessage } from '../../agent-stream/MessageTypes'
import type { NarrativeBlock } from '../types'

const PHASE_LABELS: Record<string, string> = {
  planning: '📋 规划阶段',
  exploration: '🔍 探索阶段',
  implementation: '🔧 实施阶段',
  verification: '✓ 验证阶段',
  completed: '✅ 任务完成',
  failed: '✗ 任务失败',
}

/**
 * 生成阶段摘要块。
 * 在 phase_changed 事件后，统计该阶段内的消息并生成摘要。
 */
export function buildPhaseSummary(
  fromPhase: string,
  toPhase: string,
  phaseMessages: AgentMessage[],
): NarrativeBlock {
  const tools = phaseMessages.filter((m) => m.type === 'tool')
  const facts = phaseMessages.filter((m) => m.type === 'world_update')
  const decisions = phaseMessages.filter((m) => m.type === 'decision')
  const errors = phaseMessages.filter((m) => m.type === 'error')

  // 工具统计
  const toolTypes = [...new Set(tools.map((t) => (t.data.tool as string) || ''))].filter(Boolean)
  const toolCount = tools.length

  // 事实统计
  const factCount = facts.length
  const factEntities = new Set<string>()
  const kw = (m: AgentMessage) => {
    const txt = (m.data.fact as string) || ''
    txt.split(/[，。、：；！？\s]+/).filter((t) => t.length >= 2).forEach((t) => factEntities.add(t))
  }
  facts.forEach(kw)

  // EVI 统计
  const eviScores = tools
    .map((t) => t.data.evi_score as number | undefined)
    .filter((v): v is number => v !== undefined)
  const avgEvi =
    eviScores.length > 0 ? eviScores.reduce((a, b) => a + b, 0) / eviScores.length : null

  const errorCount = errors.length

  // 构建摘要文本
  const summaryParts: string[] = []
  if (toolCount > 0) summaryParts.push(`工具调用 ${toolCount} 次`)
  if (toolTypes.length > 0) summaryParts.push(`使用 ${toolTypes.slice(0, 4).join('、')} 等工具`)
  if (factCount > 0) summaryParts.push(`发现 ${factCount} 条事实`)
  if (avgEvi !== null) summaryParts.push(`平均 EVI ${avgEvi.toFixed(2)}`)
  if (errorCount > 0) summaryParts.push(`错误 ${errorCount} 个`)

  const label = PHASE_LABELS[toPhase] || `阶段变更: ${toPhase}`

  return {
    id: `phase-summary-${fromPhase}-${toPhase}`,
    type: 'phase_summary',
    childIds: [],
    title: label,
    summary: summaryParts.join(' · '),
    children: [],
    meta: {
      fromPhase,
      toPhase,
      toolCount,
      toolTypes,
      factCount,
      avgEvi,
      errorCount,
      decisionCount: decisions.length,
      entities: [...factEntities].slice(0, 12),
    },
    status: toPhase === 'failed' ? 'failed' : 'completed',
    timestamp: phaseMessages[0]?.timestamp || new Date().toISOString(),
    collapsible: true,
  }
}

/**
 * 跳过已属于 phase_summary 块的消息，不重复加入流。
 */
export function skipPhaseMessages(messages: AgentMessage[], phaseMessages: Set<string>): AgentMessage[] {
  return messages.filter((m) => !phaseMessages.has(m.id))
}
