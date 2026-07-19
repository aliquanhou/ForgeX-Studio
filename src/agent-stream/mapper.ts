/** Event → AgentMessage 映射器。
 *
 *  把 Runtime 的原始事件流转换成用户能理解的 Agent 思考轨迹。
 *  处理工具配对（started/completed）、EVI 归并、阶段过渡等。
 */
import type { ForgeEvent } from '../stores/runtime'
import type { AgentMessage } from './MessageTypes'

/**
 * 将事件数组映射为 AgentMessage 数组。
 * 对于工具调用、审批等配对事件，自动合并到同一条消息。
 */
export function mapEvents(events: ForgeEvent[]): AgentMessage[] {
  const result: AgentMessage[] = []

  function p(ev: ForgeEvent, key: string): string {
    const v = (ev.payload as Record<string, unknown>)[key]
    return typeof v === 'string' ? v : ''
  }

  function pn(ev: ForgeEvent, key: string): number | null {
    const v = (ev.payload as Record<string, unknown>)[key]
    return typeof v === 'number' ? v : null
  }

  for (const ev of events) {
    switch (ev.kind) {
      /* ── 用户消息 ─────────────────────────── */
      case 'user_message':
        result.push({
          id: ev.event_id,
          type: 'user_message',
          status: 'completed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      /* ── 意图分类 ─────────────────────────── */
      case 'intent_classified':
        result.push({
          id: ev.event_id,
          type: 'intent',
          status: 'completed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      /* ── 计划创建 ─────────────────────────── */
      case 'plan_created':
        result.push({
          id: ev.event_id,
          type: 'plan',
          status: 'completed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      /* ── 工具调用 ─────────────────────────── */
      case 'tool_started': {
        // 如果上一个工具还在 running，先标记为 completed（防御性容错）
        for (let i = result.length - 1; i >= 0; i--) {
          if (result[i].type === 'tool' && result[i].status === 'running') {
            result[i] = { ...result[i], status: 'completed' }
            break
          }
        }
        result.push({
          id: ev.event_id,
          type: 'tool',
          status: 'running',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break
      }

      case 'tool_completed': {
        // 合并到最后一个 running 工具消息
        const idx = findLastRunning(result, 'tool')
        if (idx >= 0) {
          result[idx] = {
            ...result[idx],
            status: 'completed',
            data: { ...result[idx].data, ...ev.payload },
          }
        }
        break
      }

      case 'tool_failed':
      case 'tool_rejected': {
        const idx = findLastRunning(result, 'tool')
        if (idx >= 0) {
          result[idx] = {
            ...result[idx],
            status: 'failed',
            data: { ...result[idx].data, ...ev.payload, rejected: ev.kind === 'tool_rejected' },
          }
        }
        break
      }

      /* ── 决策 ──────────────────────────────── */
      case 'action_selected': {
        // 上一个决策如果还在 pending 标为 expired
        for (let i = result.length - 1; i >= 0; i--) {
          if (result[i].type === 'decision' && result[i].status === 'pending') {
            result[i] = { ...result[i], status: 'completed' }
            break
          }
        }
        result.push({
          id: ev.event_id,
          type: 'decision',
          status: 'completed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break
      }

      case 'ask_approval':
        result.push({
          id: ev.event_id,
          type: 'decision',
          status: 'pending',
          timestamp: ev.timestamp,
          data: { ...ev.payload, needsApproval: true },
        })
        break

      case 'approval_granted':
      case 'approval_denied': {
        const idx = findLastPending(result, 'decision')
        if (idx >= 0) {
          result[idx] = {
            ...result[idx],
            status: ev.kind === 'approval_granted' ? 'completed' : 'failed',
            data: {
              ...result[idx].data,
              ...ev.payload,
              approved: ev.kind === 'approval_granted',
            },
          }
        }
        break
      }

      /* ── EVI 评估 → 合并到最近的工具或决策 ──── */
      case 'evi_evaluated': {
        // 优先合并到最近的工具，其次最近的决策
        let target = -1
        for (let i = result.length - 1; i >= 0; i--) {
          if (result[i].type === 'tool' || result[i].type === 'decision') {
            target = i
            break
          }
        }
        if (target >= 0) {
          result[target] = {
            ...result[target],
            data: {
              ...result[target].data,
              evi_score: pn(ev, 'score'),
              info_gain: pn(ev, 'info_gain'),
              progress: pn(ev, 'progress'),
              risk_reduction: pn(ev, 'risk_reduction'),
              cost: pn(ev, 'cost'),
            },
          }
        }
        break
      }

      /* ── 世界模型更新 ──────────────────────── */
      case 'fact_confirmed':
        result.push({
          id: ev.event_id,
          type: 'world_update',
          status: 'completed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      /* ── 制品 ────────────────────────────── */
      case 'artifact_created':
        result.push({
          id: ev.event_id,
          type: 'artifact',
          status: 'completed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      /* ── 验证 ────────────────────────────── */
      case 'verify_started':
        result.push({
          id: ev.event_id,
          type: 'thought',
          status: 'running',
          timestamp: ev.timestamp,
          data: { ...ev.payload, label: '验证中' },
        })
        break

      case 'verify_completed':
      case 'verify_failed': {
        const idx = findLastRunning(result, 'thought')
        if (idx >= 0) {
          result[idx] = {
            ...result[idx],
            status: ev.kind === 'verify_completed' ? 'completed' : 'failed',
            data: { ...result[idx].data, ...ev.payload },
          }
        }
        break
      }

      /* ── 阶段过渡 ──────────────────────────── */
      case 'phase_changed':
        result.push({
          id: ev.event_id,
          type: 'phase_header',
          status: 'completed',
          timestamp: ev.timestamp,
          data: { from: p(ev, 'from'), to: p(ev, 'to') },
        })
        break

      /* ── 任务完成 ──────────────────────────── */
      case 'task_completed':
        result.push({
          id: ev.event_id,
          type: 'completion',
          status: 'completed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      case 'task_failed':
        result.push({
          id: ev.event_id,
          type: 'completion',
          status: 'failed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      /* ── 错误 ────────────────────────────── */
      case 'error':
        result.push({
          id: ev.event_id,
          type: 'error',
          status: 'failed',
          timestamp: ev.timestamp,
          data: ev.payload,
        })
        break

      /* ── 跳过内部事件 ──────────────────────── */
      // task_started / task_cancelled → 从 phase_header 和 completion 推断
      // state_compressed / log / budget_* / force_finalize → Runtime 内部
      // approval_granted/denied 已合并到 decision pending
      default:
        break
    }
  }

  return result
}

/* ── 辅助查找 ───────────────────────────────── */

function findLastRunning(messages: AgentMessage[], type: string): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === type && messages[i].status === 'running') return i
  }
  return -1
}

function findLastPending(messages: AgentMessage[], type: string): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type === type && messages[i].status === 'pending') return i
  }
  return -1
}
