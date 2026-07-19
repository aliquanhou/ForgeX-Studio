/** Phase 0.5 -- Mock event data simulating a full ForgeX task lifecycle.
 *
 * Task: "分析并优化项目架构"
 * Covers: intent classification, planning, exploration (grep/read/find_symbol),
 *         EVI evaluation, fact confirmation, deployment, completion.
 */

import type { ForgeEvent } from '../stores/runtime'

const TASK_ID = 'mock-001'

let _seq = 0
function id(): string {
  _seq++
  return `mock-${String(_seq).padStart(4, '0')}`
}

let offset = 0
function ts(sec: number): string {
  const d = new Date()
  d.setSeconds(d.getSeconds() + sec - offset)
  offset = sec
  return d.toISOString()
}

export const MOCK_EVENTS: ForgeEvent[] = [
  // ── User input ────────────────────────────────────────
  {
    kind: 'user_message',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(0),
    payload: { message: '分析并优化项目架构', mode: 'analysis' },
  },

  // ── Phase 1: Task Init ───────────────────────────────
  {
    kind: 'task_started',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(0),
    payload: { goal: '分析并优化项目架构', intent: 'analyze', intent_confidence: 0.94 },
  },
  {
    kind: 'intent_classified',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(1),
    payload: { intent: 'analyze', confidence: 0.94, reason: '检测到关键词"分析"和"优化"' },
  },

  // ── Phase 2: Planning ────────────────────────────────
  {
    kind: 'phase_changed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(2),
    payload: { from: 'init', to: 'planning' },
  },
  {
    kind: 'action_selected',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(3),
    payload: { action: 'PLAN', reason: 'Need to create structured analysis plan', confidence: 0.85 },
  },
  {
    kind: 'tool_completed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(4),
    payload: { tool: 'plan', result_summary: 'Plan: 4 steps — discover modules, map deps, analyze architecture, generate report' },
  },

  // ── Phase 3: Exploration (grep) ──────────────────────
  {
    kind: 'phase_changed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(5),
    payload: { from: 'planning', to: 'exploration' },
  },
  {
    kind: 'action_selected',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(6),
    payload: {
      action: 'EXPLORE', reason: 'grep for class definitions to find module boundaries',
      confidence: 0.82, evi_score: 0.65, knowledge_coverage: 0.15, uncertainty_entropy: 0.72,
    },
  },
  {
    kind: 'tool_started',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(7),
    payload: { tool: 'grep', target: 'class.*(Manager|Engine|Runtime)', params: { pattern: 'class.*(Manager|Engine|Runtime)' } },
  },
  {
    kind: 'tool_completed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(8),
    payload: { tool: 'grep', target: 'class defs', evi_score: 0.65, duration_ms: 420, result_summary: '6 classes found' },
  },
  {
    kind: 'fact_confirmed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(9),
    payload: {
      fact: '核心模块: kernel/ (Runtime), decision/ (DecisionEngine), memory/, knowledge/, tools/, api/',
      source: 'grep', confidence: 1.0,
    },
  },
  {
    kind: 'evi_evaluated',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(10),
    payload: { score: 0.65, info_gain: 0.5, progress: 0.4, risk_reduction: 0.2, cost: 0.15, tool: 'grep', cost_effective: true },
  },

  // ── Exploration (read_file) ──────────────────────────
  {
    kind: 'action_selected',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(11),
    payload: {
      action: 'EXPLORE', reason: 'read_file: understand Runtime core loop',
      confidence: 0.88, evi_score: 0.82, knowledge_coverage: 0.35, uncertainty_entropy: 0.45,
    },
  },
  {
    kind: 'tool_started',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(12),
    payload: { tool: 'read_file', target: 'forge/kernel/runtime.py', params: { path: 'forge/kernel/runtime.py' } },
  },
  {
    kind: 'tool_completed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(13),
    payload: { tool: 'read_file', target: 'runtime.py', evi_score: 0.82, duration_ms: 45, result_summary: '347 lines — Runtime orchestrator' },
  },
  {
    kind: 'fact_confirmed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(14),
    payload: {
      fact: 'Runtime 是 ForgeX 核心编排器，拥有 state/budget/eventbus/scheduler',
      source: 'read_file', confidence: 1.0,
    },
  },

  // ── Exploration (find_symbol) ────────────────────────
  {
    kind: 'action_selected',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(15),
    payload: {
      action: 'EXPLORE', reason: 'find_symbol: trace DecisionEngine workflow',
      confidence: 0.91, evi_score: 0.88, knowledge_coverage: 0.50, uncertainty_entropy: 0.30,
    },
  },
  {
    kind: 'tool_started',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(16),
    payload: { tool: 'find_symbol', target: 'DecisionEngine', params: { symbol: 'DecisionEngine', kind: 'class' } },
  },
  {
    kind: 'tool_completed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(17),
    payload: { tool: 'find_symbol', target: 'DecisionEngine', evi_score: 0.91, duration_ms: 120, result_summary: 'Found in decision/engine.py:42' },
  },
  {
    kind: 'fact_confirmed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(18),
    payload: {
      fact: 'DecisionEngine: 9 种决策类型，集成 EVI 评估与 LLM Judge 回退',
      source: 'find_symbol', confidence: 0.95,
    },
  },
  {
    kind: 'evi_evaluated',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(19),
    payload: { score: 0.91, info_gain: 0.8, progress: 0.6, risk_reduction: 0.5, cost: 0.08, tool: 'find_symbol', cost_effective: true },
  },

  // ── Decision Point: High Risk ────────────────────────
  {
    kind: 'decision_pending',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(20),
    payload: {
      decision_id: 'dec-001',
      action: 'generate_report',
      reason: 'Sufficient evidence gathered — ready to compile architecture report',
      risk: 'HIGH',
      impact: 'Will produce architecture-report.md with structural recommendations',
      confidence: 0.92, evi_score: 0.85, knowledge_coverage: 0.82, uncertainty_entropy: 0.12,
      alternatives: [],
    },
  },

  // ── Phase 4: Implementation ──────────────────────────
  {
    kind: 'decision_approved',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(21),
    payload: { decision_id: 'dec-001', action: 'generate_report', approved: true },
  },
  {
    kind: 'phase_changed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(22),
    payload: { from: 'exploration', to: 'implementation' },
  },
  {
    kind: 'action_selected',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(23),
    payload: { action: 'IMPLEMENT', reason: 'Generate architecture analysis report', confidence: 0.93 },
  },
  {
    kind: 'tool_started',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(24),
    payload: { tool: 'write_file', target: 'analysis/architecture-report.md', params: { path: 'analysis/architecture-report.md' } },
  },
  {
    kind: 'tool_completed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(25),
    payload: { tool: 'write_file', target: 'report.md', duration_ms: 89, result_summary: 'Architecture report written (3.2 KB)' },
  },
  {
    kind: 'artifact_created',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(26),
    payload: { id: 'artifact-001', kind: 'report', path: 'analysis/architecture-report.md', state: 'generated', size: 3276, version: 1 },
  },

  // ── Phase 5: Verification ────────────────────────────
  {
    kind: 'phase_changed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(27),
    payload: { from: 'implementation', to: 'verification' },
  },
  {
    kind: 'action_selected',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(28),
    payload: { action: 'VERIFY', reason: 'Validate report completeness', confidence: 0.90 },
  },
  {
    kind: 'tool_completed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(29),
    payload: { tool: 'verify', target: 'report completeness', duration_ms: 210, result_summary: 'All 4 report sections present, 0 issues' },
  },

  // ── Phase 6: Completion ──────────────────────────────
  {
    kind: 'phase_changed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(30),
    payload: { from: 'verification', to: 'completed' },
  },
  {
    kind: 'task_completed',
    task_id: TASK_ID,
    event_id: id(), timestamp: ts(31),
    payload: { rounds: 6, tokens_used: 4850, elapsed_seconds: 31.2, phase: 'completed' },
  },
]
