import { useStore } from '../stores/runtime'

const MEMORY_TIERS = [
  {
    name: 'Short-Term',
    icon: 'S',
    desc: 'Current task context',
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
  },
  {
    name: 'Episodic',
    icon: 'E',
    desc: 'Past task experiences',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
  {
    name: 'Semantic',
    icon: 'M',
    desc: 'Project knowledge graph',
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    border: 'border-accent-500/20',
  },
  {
    name: 'Procedural',
    icon: 'P',
    desc: 'Success patterns',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
]

export function MemoryConsole() {
  const events = useStore((s) => s.events)
  const facts = events.filter((e) => e.kind === 'fact_confirmed')
  const actions = events.filter((e) => e.kind === 'action_selected')

  return (
    <div className="space-y-3">
      {/* Four memory tiers */}
      {MEMORY_TIERS.map((tier) => (
        <div key={tier.name} className={`rounded-lg border ${tier.bg} ${tier.border} p-3`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-5 h-5 rounded flex items-center justify-center text-2xs font-bold ${tier.bg} ${tier.color}`}>
              {tier.icon}
            </div>
            <div>
              <span className={`text-xs font-medium ${tier.color}`}>{tier.name}</span>
              <span className="text-2xs text-surface-500 ml-2">{tier.desc}</span>
            </div>
          </div>
          <div className="text-2xs text-surface-500 mt-1">
            {tier.name === 'Short-Term' && `Facts: ${facts.length} · Events: ${events.length}`}
            {tier.name === 'Episodic' && 'No prior episodes recorded'}
            {tier.name === 'Semantic' && 'Entities: 0 · Relations: 0'}
            {tier.name === 'Procedural' && 'Patterns: 0 · Confidence: —'}
          </div>
        </div>
      ))}

      {/* Memory stats */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-xs font-medium text-surface-300 mb-2">Memory Operations</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold font-mono text-surface-200">{facts.length}</div>
            <div className="text-2xs text-surface-500">Writes</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-surface-200">{events.length}</div>
            <div className="text-2xs text-surface-500">Entries</div>
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-surface-200">—</div>
            <div className="text-2xs text-surface-500">Retrievals</div>
          </div>
        </div>
      </div>
    </div>
  )
}
