import type { AgentMessageProps } from '../MessageTypes'

export function ArtifactCard({ message }: AgentMessageProps) {
  const kind = (message.data.kind as string) || ''
  const path = (message.data.path as string) || ''
  const size = message.data.size as number | undefined
  const version = message.data.version as number | undefined

  return (
    <div className="bg-accent-500/5 border border-accent-500/10 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className="text-accent-400 text-xs">□</span>
        <span className="text-xs font-mono text-surface-200">
          {kind}
        </span>
        <span className="text-surface-500 text-xs">→</span>
        <span className="text-xs font-mono text-surface-400 truncate">{path}</span>
      </div>
      {(version !== undefined || size !== undefined) && (
        <div className="flex items-center gap-3 mt-1 text-2xs text-surface-500">
          {version !== undefined && <span>v{version}</span>}
          {size !== undefined && <span>{(size / 1024).toFixed(1)} KB</span>}
        </div>
      )}
    </div>
  )
}
