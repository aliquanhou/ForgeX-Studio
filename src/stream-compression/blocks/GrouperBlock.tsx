/** GrouperBlock — 压缩后的聚合块（Tool Group / Fact Group / Phase Summary）。
 *
 *  默认折叠，点击展开显示原始子消息，点击块本身打开 Inspector。
 */
import { useState } from 'react'
import type { NarrativeBlock } from '../types'
import { useInspectorStore } from '../../stores/inspector'
import { AgentMessage as AgentMessageCard } from '../../agent-stream/AgentMessage'

interface GrouperBlockProps {
  block: NarrativeBlock
  isLatest?: boolean
}

export function GrouperBlock({ block, isLatest }: GrouperBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const openInspector = useInspectorStore((s) => s.openInspector)

  const handleClick = () => {
    // 展开时点击只切换展开状态
    if (expanded) return

    // 根据块类型映射到 Inspector 标签
    const tabMap: Record<string, 'tools' | 'world' | 'task'> = {
      tool_group: 'tools',
      fact_group: 'world',
      phase_summary: 'task',
    }
    const tab = tabMap[block.type] || 'task'

    openInspector({
      type: block.type as any,
      id: block.id,
      payload: block.meta,
      tab,
    })
  }

  const isPhaseSummary = block.type === 'phase_summary'
  const isToolGroup = block.type === 'tool_group'
  const isFactGroup = block.type === 'fact_group'

  return (
    <div
      className={`px-4 py-2 border-b border-surface-800 last:border-0 transition-colors
        ${isLatest ? 'bg-accent-500/[0.02]' : ''}
        ${isPhaseSummary ? 'bg-surface-900/30' : 'bg-surface-950'}
        cursor-pointer hover:bg-surface-800/20`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs">
            {isToolGroup ? '🔧' : isFactGroup ? '🌎' : isPhaseSummary ? '📊' : '📦'}
          </span>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          {/* 标题行 */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wider
              ${isPhaseSummary
                ? block.status === 'failed' ? 'text-error' : 'text-surface-300'
                : 'text-surface-300'
              }`}
            >
              {block.title}
            </span>
            <span className="text-2xs text-surface-600">
              {block.type === 'tool_group'
                ? `${block.meta.count as number} 次调用`
                : block.type === 'fact_group'
                  ? `${block.meta.count as number} 条事实`
                  : ''}
            </span>
            {block.type !== 'phase_summary' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(!expanded)
                }}
                className="ml-auto text-2xs text-surface-500 hover:text-surface-300 transition-colors"
              >
                {expanded ? '收起' : '展开'}
              </button>
            )}
          </div>

          {/* 摘要行 */}
          <div className="text-2xs text-surface-500 leading-relaxed">
            {block.summary}
          </div>

          {/* meta 数据行 */}
          <div className="flex flex-wrap gap-3 mt-1.5 text-2xs text-surface-500">
            {block.meta.avgEvi !== undefined && block.meta.avgEvi !== null && (
              <span>
                EVI <span className="text-info font-mono">{(block.meta.avgEvi as number).toFixed(2)}</span>
              </span>
            )}
            {block.meta.avgConfidence !== undefined && block.meta.avgConfidence !== null && (
              <span>
                置信度 <span className="text-success font-mono">
                  {((block.meta.avgConfidence as number) * 100).toFixed(0)}%
                </span>
              </span>
            )}
            {block.type === 'tool_group' && block.meta.totalDuration !== undefined && (
              <span>
                耗时 <span className="text-surface-400 font-mono">
                  {(block.meta.totalDuration as number).toFixed(0)}ms
                </span>
              </span>
            )}
            {block.type === 'fact_group' && (block.meta.entities as string[])?.length > 0 && (
              <span className="truncate max-w-[200px]">
                实体: <span className="text-surface-400">
                  {(block.meta.entities as string[]).slice(0, 5).join(', ')}
                </span>
              </span>
            )}
            {block.type === 'phase_summary' && (
              <>
                {(block.meta.toolCount as number) > 0 && (
                  <span>工具: <span className="text-surface-400 font-mono">{block.meta.toolCount as number}</span></span>
                )}
                {(block.meta.factCount as number) > 0 && (
                  <span>事实: <span className="text-surface-400 font-mono">{block.meta.factCount as number}</span></span>
                )}
              </>
            )}
          </div>

          {/* 展开后的子消息 */}
          {expanded && block.children.length > 0 && (
            <div className="mt-2 ml-0 border-l-2 border-surface-700/50 pl-3 space-y-1">
              {block.children.map((child) => (
                <AgentMessageCard
                  key={child.id}
                  message={child}
                  isLatest={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
