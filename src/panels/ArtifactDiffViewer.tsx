import { useStore } from '../stores/runtime'

export function ArtifactDiffViewer() {
  const events = useStore((s) => s.events)
  const artifacts = events.filter((e) => e.kind === 'artifact_created')

  if (artifacts.length === 0) {
    return (
      <div className="space-y-3">
        {/* Empty state */}
        <div className="rounded-lg bg-surface-900/50 border p-4">
          <div className="text-xs font-medium text-surface-300 mb-1">Artifact Lifecycle</div>
          <div className="flex items-center gap-1 text-2xs text-surface-600 mb-3">
            {['DRAFT', 'GENERATED', 'VALIDATED', 'APPROVED', 'COMMITTED'].map((state, i, arr) => (
              <>
                <span key={state} className="text-surface-700">{state}</span>
                {i < arr.length - 1 && <span className="text-surface-800">→</span>}
              </>
            ))}
          </div>
          <div className="text-2xs text-surface-600">No artifacts produced yet.</div>
        </div>

        {/* Diff viewer empty */}
        <div className="rounded-lg bg-surface-900/50 border p-4">
          <div className="text-xs font-medium text-surface-300 mb-2">Diff Viewer</div>
          <div className="bg-surface-950 rounded p-3 font-mono text-2xs text-surface-700">
            {'Waiting for changes...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Artifact pipeline */}
      <div className="rounded-lg bg-surface-900/50 border p-4">
        <div className="text-xs font-medium text-surface-300 mb-2">Artifact Pipeline</div>
        <div className="flex items-center gap-1 text-2xs">
          {['DRAFT', 'GENERATED', 'VALIDATED', 'APPROVED', 'COMMITTED'].map((state, i, arr) => (
            <>
              <span key={state} className={`px-2 py-0.5 rounded ${
                i <= 2 ? 'bg-accent-500/20 text-accent-400' : 'text-surface-600'
              }`}>
                {state}
              </span>
              {i < arr.length - 1 && <span className="text-surface-700">→</span>}
            </>
          ))}
        </div>
      </div>

      {/* Artifact list */}
      <div className="space-y-1">
        {artifacts.slice(-5).reverse().map((a) => (
          <div key={a.event_id} className="flex items-center justify-between p-2 rounded bg-surface-900/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-surface-400">□</span>
              <span className="text-surface-200">{(a.payload.kind as string) || 'artifact'}</span>
              <span className="text-2xs text-surface-500">{(a.payload.path as string) || ''}</span>
            </div>
            <span className="text-2xs text-surface-600">
              {(a.payload.size as number) ? `${(a.payload.size as number)} bytes` : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Diff viewer */}
      <div className="rounded-lg bg-surface-900/50 border p-4">
        <div className="text-xs font-medium text-surface-300 mb-2">Diff Viewer</div>
        <div className="bg-surface-950 rounded p-3 font-mono text-2xs text-surface-700">
          {'Select an artifact to view diff'}
        </div>
      </div>
    </div>
  )
}
