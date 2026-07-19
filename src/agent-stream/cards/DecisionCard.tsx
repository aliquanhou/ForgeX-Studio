import type { AgentMessageProps, MessageType } from '../MessageTypes'

interface DecisionCardProps extends AgentMessageProps {
  onSelect?: (type: MessageType, id: string) => void
}

export function DecisionCard({ message, onSelect }: DecisionCardProps) {
  const action = (message.data.action as string) || ''
  const reason = (message.data.reason as string) || ''
  const confidence = message.data.confidence as number | undefined
  const eviScore = message.data.evi_score as number | undefined
  const infoGain = message.data.info_gain as number | undefined
  const knowledgeCoverage = message.data.knowledge_coverage as number | undefined
  const uncertaintyEntropy = message.data.uncertainty_entropy as number | undefined
  const needsApproval = message.data.needsApproval === true
  const risk = (message.data.risk as string) || ''
  const approved = message.data.approved as boolean | undefined

  const handleClick = () => {
    if (onSelect && message.type === 'decision') {
      onSelect('decision', message.id)
    }
  }

  /* ── 等待审批 ───────────────────────────── */
  if (needsApproval && message.status === 'pending') {
    return (
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3" onClick={handleClick}>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-warning text-2xs">需要审批</span>
          {risk && <span className="badge badge-error text-2xs">风险: {risk}</span>}
        </div>
        <div className="text-sm font-mono text-surface-200 font-medium mb-1">{action}</div>
        {reason && <div className="text-2xs text-surface-400 mb-2">{reason}</div>}
        <div className="flex gap-2">
          <button className="px-3 py-1 text-2xs font-medium bg-success hover:bg-success/80 text-white rounded transition-colors">
            批准
          </button>
          <button className="px-3 py-1 text-2xs font-medium bg-error hover:bg-error/80 text-white rounded transition-colors">
            拒绝
          </button>
        </div>
      </div>
    )
  }

  /* ── 审批结果 ───────────────────────────── */
  if (needsApproval && approved !== undefined) {
    return (
      <div className={`rounded-lg border p-3 ${approved ? 'bg-success/10 border-success/30' : 'bg-error/10 border-error/30'}`} onClick={handleClick}>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${approved ? 'text-success' : 'text-error'}`}>
            {approved ? '✓ 已批准' : '✗ 已拒绝'}
          </span>
          <span className="text-xs font-mono text-surface-300">{action}</span>
        </div>
      </div>
    )
  }

  /* ── 普通决策 ───────────────────────────── */
  return (
    <div className="cursor-pointer" onClick={handleClick}>
      <div className="flex items-center gap-2 mb-1">
        <span className="badge badge-info text-2xs font-mono">{action}</span>
        {confidence !== undefined && (
          <span className="text-2xs text-surface-500 font-mono">
            置信度: {(confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {reason && (
        <div className="text-xs text-surface-400 mb-1.5 leading-snug">{reason}</div>
      )}

      {/* EVI 指标 */}
      {(eviScore !== undefined || infoGain !== undefined || knowledgeCoverage !== undefined) && (
        <div className="flex flex-wrap gap-3 text-2xs text-surface-500">
          {eviScore !== undefined && (
            <span>EVI: <span className="text-info font-mono">{eviScore.toFixed(2)}</span></span>
          )}
          {infoGain !== undefined && (
            <span>Δ信息: <span className="text-info font-mono">{infoGain.toFixed(2)}</span></span>
          )}
          {knowledgeCoverage !== undefined && (
            <span>知识: <span className="text-success font-mono">{(knowledgeCoverage * 100).toFixed(0)}%</span></span>
          )}
          {uncertaintyEntropy !== undefined && (
            <span>熵: <span className="text-warning font-mono">{uncertaintyEntropy.toFixed(2)}</span></span>
          )}
        </div>
      )}
    </div>
  )
}
