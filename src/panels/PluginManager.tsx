import { useState } from 'react'
import { useStore } from '../stores/runtime'

const INSTALLED_PLUGINS = [
  { name: 'Python Analyzer', version: '1.0.0', status: 'active', desc: 'AST analysis, syntax check, pytest runner' },
  { name: 'Git Tools', version: '1.0.0', status: 'active', desc: 'Git operations, diff, commit, log' },
]

const AVAILABLE_PLUGINS = [
  { name: 'Claude Model', version: '0.1.0', desc: 'Claude API model provider' },
  { name: 'Qwen Model', version: '0.1.0', desc: 'Qwen local model provider' },
  { name: 'Docker Tool', version: '0.1.0', desc: 'Docker container management' },
  { name: 'Web Plugin', version: '0.1.0', desc: 'Browser automation and web scraping' },
]

export function PluginManager() {
  const [tab, setTab] = useState<'installed' | 'available'>('installed')
  const events = useStore((s) => s.events)
  const totalEvents = events.length

  return (
    <div className="space-y-3">
      {/* Kernel info */}
      <div className="rounded-lg bg-surface-900/50 border p-3">
        <div className="text-xs font-medium text-surface-300 mb-1">Runtime Kernel</div>
        <div className="grid grid-cols-2 gap-2 text-2xs">
          <div>
            <span className="text-surface-500">Version: </span>
            <span className="text-surface-300">v0.5 LTS</span>
          </div>
          <div>
            <span className="text-surface-500">Frozen: </span>
            <span className="text-success">Yes</span>
          </div>
          <div>
            <span className="text-surface-500">Modules: </span>
            <span className="text-surface-300">15</span>
          </div>
          <div>
            <span className="text-surface-500">Events: </span>
            <span className="text-surface-300">{totalEvents}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-900 rounded-lg">
        <button
          onClick={() => setTab('installed')}
          className={`flex-1 py-1 text-xs rounded-md transition-colors ${
            tab === 'installed' ? 'bg-surface-800 text-surface-200' : 'text-surface-500 hover:text-surface-300'
          }`}
        >
          Installed ({INSTALLED_PLUGINS.length})
        </button>
        <button
          onClick={() => setTab('available')}
          className={`flex-1 py-1 text-xs rounded-md transition-colors ${
            tab === 'available' ? 'bg-surface-800 text-surface-200' : 'text-surface-500 hover:text-surface-300'
          }`}
        >
          Available ({AVAILABLE_PLUGINS.length})
        </button>
      </div>

      {/* Plugin list */}
      {tab === 'installed' ? (
        <div className="space-y-1">
          {INSTALLED_PLUGINS.map((p) => (
            <div key={p.name} className="rounded-lg bg-surface-900/50 border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-surface-200">{p.name}</span>
                    <span className="text-2xs text-surface-500">v{p.version}</span>
                  </div>
                  <div className="text-2xs text-surface-500 mt-0.5">{p.desc}</div>
                </div>
                <span className="badge badge-success">{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {AVAILABLE_PLUGINS.map((p) => (
            <div key={p.name} className="rounded-lg bg-surface-900/50 border border-dashed p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-surface-400">{p.name}</span>
                    <span className="text-2xs text-surface-600">v{p.version}</span>
                  </div>
                  <div className="text-2xs text-surface-600 mt-0.5">{p.desc}</div>
                </div>
                <button className="px-2 py-1 text-2xs text-accent-400 hover:text-accent-300 border border-accent-500/30 rounded transition-colors">
                  Install
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
