/** Right inspector — 控制中心。
 *
 *  正常模式：6 标签页（任务/决策/世界/记忆/工具/插件）
 *  联动模式：选中 Agent 消息后，自动显示该消息的深层细节
 *
 *  Stream = 时间线 | Inspector = 当前上下文的放大镜
 */
import { useInspectorStore, type InspectorTab } from '../stores/inspector'
import { useStore } from '../stores/runtime'
import { WorldModelViewer } from '../panels/WorldModelViewer'
import { ToolExecutionPanel } from '../panels/ToolExecutionPanel'
import { MemoryConsole } from '../panels/MemoryConsole'
import { PluginManager } from '../panels/PluginManager'
import { Brain, GitBranch, Database, Terminal, Puzzle, List, X, ArrowLeft } from 'lucide-react'

const TABS = [
  { key: 'task' as InspectorTab, label: '任务', icon: List },
  { key: 'decision' as InspectorTab, label: '决策', icon: Brain },
  { key: 'world' as InspectorTab, label: '世界', icon: GitBranch },
  { key: 'memory' as InspectorTab, label: '记忆', icon: Database },
  { key: 'tools' as InspectorTab, label: '工具', icon: Terminal },
  { key: 'plugins' as InspectorTab, label: '插件', icon: Puzzle },
]

interface RightInspectorProps {
  collapsed: boolean
  onToggle: () => void
}

export function RightInspector({ collapsed, onToggle }: RightInspectorProps) {
  const activeTab = useInspectorStore((s) => s.activeTab)
  const setTab = useInspectorStore((s) => s.setTab)
  const isDetailView = useInspectorStore((s) => s.isDetailView)
  const closeDetail = useInspectorStore((s) => s.closeDetail)

  if (collapsed) return null

  return (
    <aside className="w-64 bg-surface-950 border-l border-surface-800 flex flex-col overflow-hidden shrink-0">
      {/* ── Tab bar ─────────────────────────────────────── */}
      <div className="flex flex-wrap bg-surface-900/50 border-b border-surface-800 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setTab(tab.key)
              if (isDetailView) closeDetail()
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-2xs font-medium border-r border-surface-800 transition-colors ${
              activeTab === tab.key && !isDetailView
                ? 'text-surface-200 bg-surface-950'
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800/50'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={onToggle}
          className="px-2 py-1.5 text-surface-500 hover:text-surface-300 transition-colors"
          title="Close inspector"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="p-2">
          {isDetailView ? (
            <DetailContent />
          ) : (
            <>
              {activeTab === 'task' && <TaskTab />}
              {activeTab === 'decision' && <DecisionTab />}
              {activeTab === 'world' && <WorldModelViewer />}
              {activeTab === 'memory' && <MemoryConsole />}
              {activeTab === 'tools' && <ToolExecutionPanel />}
              {activeTab === 'plugins' && <PluginManager />}
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

/* ══════════════════════════════════════════════════════
   Detail Content — 选中消息后的深层细节面板
   ══════════════════════════════════════════════════════ */

function DetailContent() {
  const payload = useInspectorStore((s) => s.payload)
  const selectedType = useInspectorStore((s) => s.selectedType)
  const closeDetail = useInspectorStore((s) => s.closeDetail)
  const events = useStore((s) => s.events)

  const typeLabel: Record<string, string> = {
    tool: '工具详情',
    decision: '决策详情',
    world_update: '事实详情',
    artifact: '制品详情',
    plan: '计划详情',
    intent: '意图详情',
    completion: '任务结果',
    tool_group: '工具组详情',
    fact_group: '事实聚合详情',
    phase_summary: '阶段摘要',
  }

  return (
    <div className="space-y-3">
      {/* 标题栏 */}
      <div className="flex items-center gap-1.5 border-b border-surface-800 pb-2">
        <button
          onClick={closeDetail}
          className="p-0.5 text-surface-500 hover:text-surface-300 transition-colors"
          title="返回"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-2xs font-medium text-surface-400 uppercase tracking-wider">
          {typeLabel[selectedType || ''] || '详情'}
        </span>
      </div>

      {/* 根据选中类型渲染不同内容 */}
      {selectedType === 'tool' && <ToolDetail payload={payload} />}
      {selectedType === 'decision' && <DecisionDetail payload={payload} events={events} />}
      {selectedType === 'world_update' && <WorldDetail payload={payload} />}
      {selectedType === 'artifact' && <ArtifactDetail payload={payload} />}
      {selectedType === 'plan' && <PlanDetail payload={payload} />}
      {selectedType === 'intent' && <IntentDetail payload={payload} />}
      {selectedType === 'completion' && <CompletionDetail payload={payload} />}
      {selectedType === 'tool_group' && <ToolGroupDetail payload={payload} />}
      {selectedType === 'fact_group' && <FactGroupDetail payload={payload} />}
      {selectedType === 'phase_summary' && <PhaseSummaryDetail payload={payload} />}
      {!selectedType && (
        <div className="text-2xs text-surface-600 text-center py-8">
          点击 Stream 中的卡片查看详情
        </div>
      )}
    </div>
  )
}

/* ── 工具详情 ─────────────────────────────────────── */

function ToolDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const tool = (payload.tool as string) || ''
  const target = (payload.target as string) || ''
  const duration = payload.duration_ms as number | undefined
  const eviScore = payload.evi_score as number | undefined
  const resultSummary = (payload.result_summary as string) || ''
  const error = (payload.error as string) || ''
  const params = payload.params as Record<string, unknown> | undefined
  const kind = (payload.kind as string) || ''
  const infoGain = payload.info_gain as number | undefined
  const progress = payload.progress as number | undefined
  const riskReduction = payload.risk_reduction as number | undefined
  const cost = payload.cost as number | undefined

  return (
    <div className="space-y-2">
      <DataField label="工具" value={tool} mono highlight />
      {target && <DataField label="目标" value={target} mono />}
      {kind && <DataField label="类型" value={kind} />}
      <DataField label="状态" value={error ? '失败' : '完成'} color={error ? 'text-error' : 'text-success'} />
      {duration !== undefined && <DataField label="耗时" value={`${duration.toFixed(0)}ms`} mono />}
      {eviScore !== undefined && <DataField label="EVI 评分" value={eviScore.toFixed(2)} mono color="text-info" />}

      {/* EVI 子指标 */}
      {(infoGain !== undefined || progress !== undefined || riskReduction !== undefined || cost !== undefined) && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-1">EVI 细项</div>
          <div className="grid grid-cols-2 gap-1 text-2xs">
            {infoGain !== undefined && <span>Δ信息: <span className="text-info font-mono">{infoGain.toFixed(2)}</span></span>}
            {progress !== undefined && <span>Δ进展: <span className="text-success font-mono">{progress.toFixed(2)}</span></span>}
            {riskReduction !== undefined && <span>Δ风险: <span className="text-warning font-mono">{riskReduction.toFixed(2)}</span></span>}
            {cost !== undefined && <span>成本: <span className="text-error font-mono">{cost.toFixed(2)}</span></span>}
          </div>
        </div>
      )}

      {resultSummary && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">结果摘要</div>
          <div className="text-xs text-surface-300">{resultSummary}</div>
        </div>
      )}

      {error && (
        <div className="bg-error/10 rounded p-2">
          <div className="text-2xs text-error mb-0.5">错误</div>
          <div className="text-xs text-error/80 font-mono">{error}</div>
        </div>
      )}

      {params && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">输入参数</div>
          <pre className="text-2xs text-surface-400 font-mono whitespace-pre-wrap">{JSON.stringify(params, null, 2).slice(0, 400)}</pre>
        </div>
      )}
    </div>
  )
}

/* ── 决策详情 ─────────────────────────────────────── */

function DecisionDetail({ payload, events }: { payload: Record<string, unknown> | null; events: unknown[] }) {
  if (!payload) return null
  const action = (payload.action as string) || ''
  const reason = (payload.reason as string) || ''
  const confidence = payload.confidence as number | undefined
  const eviScore = payload.evi_score as number | undefined
  const knowledgeCoverage = payload.knowledge_coverage as number | undefined
  const uncertaintyEntropy = payload.uncertainty_entropy as number | undefined
  const risk = (payload.risk as string) || ''
  const needsApproval = payload.needsApproval === true
  const infoGain = payload.info_gain as number | undefined
  const progress = payload.progress as number | undefined
  const riskReduction = payload.risk_reduction as number | undefined

  return (
    <div className="space-y-2">
      <DataField label="决策动作" value={action} mono highlight />
      {risk && <DataField label="风险等级" value={risk} color={risk === 'HIGH' ? 'text-error' : risk === 'MEDIUM' ? 'text-warning' : 'text-success'} />}
      {confidence !== undefined && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="flex justify-between text-2xs mb-0.5">
            <span className="text-surface-500">置信度</span>
            <span className="text-surface-200 font-mono">{(confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${confidence * 100}%` }} />
          </div>
        </div>
      )}

      {/* EVI 指标聚合 */}
      <div className="bg-surface-900/30 rounded p-2">
        <div className="text-2xs text-surface-500 mb-1.5">EVI 评估</div>
        <div className="space-y-1.5">
          {eviScore !== undefined && <MiniBar label="综合评分" value={eviScore} color="bg-info" />}
          {infoGain !== undefined && <MiniBar label="信息增益" value={infoGain} color="bg-info" />}
          {progress !== undefined && <MiniBar label="进展" value={progress} color="bg-success" />}
          {riskReduction !== undefined && <MiniBar label="风险降低" value={riskReduction} color="bg-warning" />}
        </div>
      </div>

      {/* 知识指标 */}
      <div className="bg-surface-900/30 rounded p-2">
        <div className="text-2xs text-surface-500 mb-1.5">知识状态</div>
        <div className="grid grid-cols-2 gap-1 text-2xs">
          {knowledgeCoverage !== undefined && <span>覆盖率: <span className="text-success font-mono">{(knowledgeCoverage * 100).toFixed(0)}%</span></span>}
          {uncertaintyEntropy !== undefined && <span>熵: <span className="text-warning font-mono">{uncertaintyEntropy.toFixed(2)}</span></span>}
        </div>
      </div>

      {reason && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">决策理由</div>
          <div className="text-xs text-surface-300">{reason}</div>
        </div>
      )}

      {/* 审批操作 */}
      {needsApproval && (
        <div className="space-y-1.5 border-t border-surface-800 pt-2 mt-3">
          <div className="text-2xs text-warning font-semibold">需要审批</div>
          <div className="flex gap-1.5">
            <button className="flex-1 px-3 py-1.5 text-2xs font-medium bg-success hover:bg-success/80 text-white rounded transition-colors">
              批准
            </button>
            <button className="flex-1 px-3 py-1.5 text-2xs font-medium bg-error hover:bg-error/80 text-white rounded transition-colors">
              拒绝
            </button>
            <button className="flex-1 px-3 py-1.5 text-2xs font-medium bg-surface-700 hover:bg-surface-600 text-surface-300 rounded transition-colors">
              修改方案
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 世界模型详情 ─────────────────────────────────── */

function WorldDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const fact = (payload.fact as string) || ''
  const source = (payload.source as string) || ''
  const confidence = payload.confidence as number | undefined

  return (
    <div className="space-y-2">
      <div className="bg-surface-900/30 rounded p-2">
        <div className="text-2xs text-surface-500 mb-0.5">事实</div>
        <div className="text-sm text-surface-200 font-medium leading-snug">{fact}</div>
      </div>
      <DataField label="来源" value={source || '未知'} mono />
      {confidence !== undefined && (
        <DataField label="置信度" value={`${(confidence * 100).toFixed(0)}%`} color="text-success" />
      )}
    </div>
  )
}

/* ── 其他详情 ──────────────────────────────────────── */

function ArtifactDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const kind = (payload.kind as string) || ''
  const path = (payload.path as string) || ''
  const version = payload.version as number | undefined
  const size = payload.size as number | undefined

  return (
    <div className="space-y-2">
      <DataField label="类型" value={kind} mono highlight />
      <DataField label="路径" value={path} mono />
      {version !== undefined && <DataField label="版本" value={`v${version}`} mono />}
      {size !== undefined && <DataField label="大小" value={`${(size / 1024).toFixed(1)} KB`} mono />}
    </div>
  )
}

function PlanDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const goal = (payload.goal as string) || (payload.result_summary as string) || ''
  const steps = (payload.steps as string[]) || []

  return (
    <div className="space-y-2">
      {goal && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">目标</div>
          <div className="text-xs text-surface-200 font-medium">{goal}</div>
        </div>
      )}
      {steps.length > 0 && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-1">阶段 ({steps.length})</div>
          <div className="space-y-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-surface-400">
                <span className="w-4 h-4 rounded-full bg-surface-800 flex items-center justify-center text-2xs text-surface-500 shrink-0">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function IntentDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const intent = (payload.intent as string) || ''
  const confidence = payload.confidence as number | undefined
  const reason = (payload.reason as string) || ''

  return (
    <div className="space-y-2">
      <DataField label="意图" value={intent.toUpperCase()} highlight />
      {confidence !== undefined && <DataField label="置信度" value={`${(confidence * 100).toFixed(0)}%`} color="text-success" />}
      {reason && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">原因</div>
          <div className="text-xs text-surface-300">{reason}</div>
        </div>
      )}
    </div>
  )
}

function CompletionDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const rounds = payload.rounds as number | undefined
  const tokens = payload.tokens_used as number | undefined
  const elapsed = payload.elapsed_seconds as number | undefined
  const artifacts = payload.artifacts as Array<Record<string, unknown>> | undefined

  return (
    <div className="space-y-2">
      {rounds !== undefined && <DataField label="执行轮次" value={rounds} mono />}
      {tokens !== undefined && <DataField label="Token 消耗" value={tokens.toLocaleString()} mono />}
      {elapsed !== undefined && <DataField label="总耗时" value={`${elapsed.toFixed(1)}s`} mono />}
      {artifacts && artifacts.length > 0 && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-1">产出的制品 ({artifacts.length})</div>
          {artifacts.map((a, i) => (
            <div key={i} className="text-xs text-surface-400 font-mono">
              [{String(a.kind || '')}] {String(a.path || '')}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   默认标签内容（无选中消息时显示）
   ══════════════════════════════════════════════════════ */

/* ── Task tab ─────────────────────────────────────── */

function TaskTab() {
  const tasks = useStore((s) => s.tasks)
  const events = useStore((s) => s.events)

  const activeTask = tasks.find((t) => t.isRunning)
  const lastTask = tasks[tasks.length - 1]
  const task = activeTask || lastTask

  if (!task) {
    return (
      <div className="flex items-center justify-center h-32 text-2xs text-surface-600">
        No active task
      </div>
    )
  }

  const lastPhaseChange = [...events].reverse().find((e) => e.kind === 'phase_changed')
  const phase = lastPhaseChange
    ? ((lastPhaseChange.payload as Record<string, unknown>).to as string)
    : task.phase

  const completedTasks = tasks.filter((t) => !t.isRunning && t.success === true).length
  const failedTasks = tasks.filter((t) => !t.isRunning && t.success === false).length

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-2xs text-surface-500 mb-1.5 uppercase tracking-wider">
          Current Task
        </div>
        <div className="text-sm font-medium text-surface-200 leading-snug mb-2">
          {task.goal}
        </div>
        <div className="flex items-center gap-2">
          <PhaseBadge phase={phase} />
          <span className="text-2xs text-surface-500">Round {task.round}</span>
          {task.isRunning && (
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-2xs text-success">Running</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-2xs text-surface-500 mb-1.5 uppercase tracking-wider">
          Metrics
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Events', value: events.length },
            { label: 'Rounds', value: task.round },
            {
              label: 'Status',
              value: task.isRunning ? 'Active' : task.success === true ? 'Done' : task.success === false ? 'Failed' : '—',
            },
            { label: 'Phase', value: phase.toUpperCase() },
            { label: 'Completed', value: completedTasks },
            { label: 'Failed', value: failedTasks },
          ].map((m) => (
            <div key={m.label} className="bg-surface-800/30 rounded px-2 py-1.5">
              <div className="text-2xs text-surface-500">{m.label}</div>
              <div className="text-xs font-mono text-surface-200">{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Decision tab ─────────────────────────────────── */

function DecisionTab() {
  const events = useStore((s) => s.events)

  const lastIntent = [...events].reverse().find((e) => e.kind === 'intent_classified')
  const lastEvi = [...events].reverse().find((e) => e.kind === 'evi_evaluated')
  const decisions = events.filter((e) => e.kind === 'action_selected').slice(-8)
  const pending = [...events].reverse().find((e) => e.kind === 'decision_pending')
  const approved = events.filter((e) => e.kind === 'decision_approved').pop()

  const p = (event: unknown, key: string) => {
    const v = ((event as { payload: Record<string, unknown> }).payload)[key]
    return typeof v === 'string' ? v : ''
  }
  const pn = (event: unknown, key: string) => {
    const v = ((event as { payload: Record<string, unknown> }).payload)[key]
    return typeof v === 'number' ? v : 0
  }

  if (!lastIntent && decisions.length === 0 && !pending) {
    return (
      <div className="flex items-center justify-center h-32 text-2xs text-surface-600">
        No decisions yet
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {pending && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-2.5">
          <div className="text-2xs text-warning font-semibold mb-1">⚠ Pending</div>
          <div className="text-xs font-mono text-surface-200">{p(pending, 'action')}</div>
          <div className="text-2xs text-surface-500 mt-0.5">{p(pending, 'reason')}</div>
          <div className="flex gap-1.5 mt-2">
            <button className="flex-1 px-2 py-1 text-2xs font-medium bg-success hover:bg-success/80 text-white rounded transition-colors">
              Approve
            </button>
            <button className="flex-1 px-2 py-1 text-2xs font-medium bg-error hover:bg-error/80 text-white rounded transition-colors">
              Reject
            </button>
          </div>
        </div>
      )}

      {approved && !pending && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-success text-xs">✓</span>
            <span className="text-2xs font-medium text-surface-200">Approved</span>
          </div>
          <div className="text-2xs text-surface-400 mt-0.5">{p(approved, 'action')}</div>
        </div>
      )}

      {lastIntent && (
        <div className="bg-surface-900/50 border rounded-lg p-2.5">
          <div className="text-2xs text-surface-500 mb-1">Intent</div>
          <div className="flex items-center gap-2">
            <span className="badge badge-info text-2xs">{p(lastIntent, 'intent').toUpperCase()}</span>
            <span className="text-2xs text-surface-500">{(pn(lastIntent, 'confidence') * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {lastEvi && (
        <div className="bg-surface-900/50 border rounded-lg p-2.5">
          <div className="text-2xs text-surface-500 mb-1.5">EVI</div>
          <div className="space-y-1.5">
            <MiniBar label="Info Gain" value={pn(lastEvi, 'info_gain')} color="bg-info" />
            <MiniBar label="Progress" value={pn(lastEvi, 'progress')} color="bg-success" />
            <MiniBar label="Risk Red." value={pn(lastEvi, 'risk_reduction')} color="bg-warning" />
            <MiniBar label="Cost" value={pn(lastEvi, 'cost')} color="bg-error" />
          </div>
        </div>
      )}

      {decisions.length > 0 && (
        <div>
          <div className="text-2xs text-surface-500 mb-1">Decision Log</div>
          <div className="space-y-0.5">
            {decisions.map((d) => (
              <div key={d.event_id} className="flex items-center gap-2 bg-surface-900/20 rounded px-2 py-1.5">
                <span className="badge badge-info text-2xs">{p(d, 'action')}</span>
                <span className="text-2xs text-surface-500 truncate">{p(d, 'reason')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   压缩块详情组件（NarrativeBlock details）
   ══════════════════════════════════════════════════════ */

function ToolGroupDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const count = payload.count as number | undefined
  const topTool = payload.topTool as string | undefined
  const targets = payload.targets as string[] | undefined
  const avgEvi = payload.avgEvi as number | undefined
  const totalDuration = payload.totalDuration as number | undefined

  return (
    <div className="space-y-2">
      <DataField label="工具数" value={count ?? 0} mono highlight />
      {topTool && <DataField label="主要工具" value={topTool} mono />}
      {targets && targets.length > 0 && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">目标文件 ({targets.length})</div>
          <div className="space-y-0.5">
            {targets.map((t, i) => (
              <div key={i} className="text-xs text-surface-400 font-mono">· {t}</div>
            ))}
          </div>
        </div>
      )}
      {avgEvi !== undefined && <DataField label="平均 EVI" value={avgEvi.toFixed(2)} mono color="text-info" />}
      {totalDuration !== undefined && <DataField label="总耗时" value={`${totalDuration.toFixed(0)}ms`} mono />}
    </div>
  )
}

function FactGroupDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const count = payload.count as number | undefined
  const entities = payload.entities as string[] | undefined
  const sources = payload.sources as string[] | undefined
  const avgConfidence = payload.avgConfidence as number | undefined

  return (
    <div className="space-y-2">
      <DataField label="事实数" value={count ?? 0} mono highlight />
      {entities && entities.length > 0 && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">实体 ({entities.length})</div>
          <div className="flex flex-wrap gap-1">
            {entities.map((e, i) => (
              <span key={i} className="badge badge-info text-2xs">{e}</span>
            ))}
          </div>
        </div>
      )}
      {avgConfidence !== undefined && <DataField label="平均置信度" value={`${(avgConfidence * 100).toFixed(0)}%`} color="text-success" />}
      {sources && sources.length > 0 && <DataField label="来源" value={sources.join(', ')} />}
    </div>
  )
}

function PhaseSummaryDetail({ payload }: { payload: Record<string, unknown> | null }) {
  if (!payload) return null
  const fromPhase = payload.fromPhase as string | undefined
  const toPhase = payload.toPhase as string | undefined
  const toolCount = payload.toolCount as number | undefined
  const toolTypes = payload.toolTypes as string[] | undefined
  const factCount = payload.factCount as number | undefined
  const avgEvi = payload.avgEvi as number | undefined
  const errorCount = payload.errorCount as number | undefined
  const decisionCount = payload.decisionCount as number | undefined

  return (
    <div className="space-y-2">
      <DataField label="阶段" value={`${fromPhase || ''} → ${toPhase || ''}`.toUpperCase()} highlight />
      <div className="bg-surface-900/30 rounded p-2">
        <div className="text-2xs text-surface-500 mb-1">阶段统计</div>
        <div className="grid grid-cols-2 gap-1 text-2xs">
          {toolCount !== undefined && <span>工具: <span className="text-surface-300 font-mono">{toolCount}</span></span>}
          {factCount !== undefined && <span>事实: <span className="text-surface-300 font-mono">{factCount}</span></span>}
          {decisionCount !== undefined && <span>决策: <span className="text-surface-300 font-mono">{decisionCount}</span></span>}
          {errorCount !== undefined && errorCount > 0 && <span>错误: <span className="text-error font-mono">{errorCount}</span></span>}
        </div>
      </div>
      {toolTypes && toolTypes.length > 0 && (
        <div className="bg-surface-900/30 rounded p-2">
          <div className="text-2xs text-surface-500 mb-0.5">使用工具</div>
          <div className="flex flex-wrap gap-1">
            {toolTypes.map((t, i) => (
              <span key={i} className="px-1.5 py-0.5 text-2xs bg-surface-800 text-surface-400 rounded">{t}</span>
            ))}
          </div>
        </div>
      )}
      {avgEvi !== undefined && <DataField label="平均 EVI" value={avgEvi.toFixed(2)} mono color="text-info" />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   共享组件
   ══════════════════════════════════════════════════════ */

function DataField({ label, value, mono, color, highlight }: {
  label: string
  value: string | number
  mono?: boolean
  color?: string
  highlight?: boolean
}) {
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded ${highlight ? 'bg-accent-500/10 border border-accent-500/20' : 'bg-surface-900/30'}`}>
      <span className="text-2xs text-surface-500 w-14 shrink-0">{label}</span>
      <span className={`text-xs ${mono ? 'font-mono' : ''} ${color || 'text-surface-200'} ${highlight ? 'font-medium' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function PhaseBadge({ phase }: { phase: string }) {
  const colorMap: Record<string, string> = {
    planning: 'badge-info',
    exploration: 'badge-warning',
    implementation: 'badge-success',
    verification: 'badge-info',
    completed: 'badge-success',
    failed: 'badge-error',
  }
  return (
    <span className={`badge ${colorMap[phase] || 'bg-surface-700 text-surface-400'} text-2xs font-semibold`}>
      {phase.toUpperCase()}
    </span>
  )
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(value * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-2xs mb-0.5">
        <span className="text-surface-500">{label}</span>
        <span className="text-surface-400 font-mono">{value.toFixed(2)}</span>
      </div>
      <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
