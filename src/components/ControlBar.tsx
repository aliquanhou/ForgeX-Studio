/** ControlBar — v0.3.3 Autonomous Control Layer UI.
 *
 *  Five control buttons: Pause | Take Over | Resume | Rollback | Stop
 *  Plus mode selector: 🟢 Autonomous | 🟡 Observe | 🔴 Governed
 *
 *  Design: Autonomy First, Intervention Available.
 *  Default: no buttons visible (agent running autonomously).
 *  Only appear when a task is active and user needs control.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../stores/runtime'
import {
  pauseTask,
  resumeTask,
  takeOverTask,
  rollbackTask,
  stopTask,
  setTaskMode,
} from '../api/forge'

type RuntimeMode = 'autonomous' | 'observe' | 'governed'

const MODE_LABELS: Record<RuntimeMode, string> = {
  autonomous: '🟢 自主',
  observe: '🟡 观察',
  governed: '🔴 治理',
}

export function ControlBar() {
  const tasks = useStore((s) => s.tasks)
  const paused = useStore((s) => s.paused)
  const humanOverride = useStore((s) => s.humanOverride)
  const mode = useStore((s) => s.mode)
  const setPaused = useStore((s) => s.setPaused)
  const setHumanOverride = useStore((s) => s.setHumanOverride)
  const setMode = useStore((s) => s.setMode)

  const [loading, setLoading] = useState<string | null>(null)
  const [showModePicker, setShowModePicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const activeTask = tasks.find((t) => t.isRunning)
  const taskId = activeTask?.taskId

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowModePicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const call = useCallback(
    async (action: string, fn: () => Promise<unknown>) => {
      if (!taskId || loading) return
      setLoading(action)
      try {
        const result = await fn()
        console.log(`[Control] ${action}:`, result)
      } catch (e) {
        console.error(`[Control] ${action} failed:`, e)
      } finally {
        setLoading(null)
      }
    },
    [taskId, loading],
  )

  // No active task — hide control bar
  if (!taskId) return null

  const hasControl = paused || humanOverride
  const isLoading = (action: string) => loading === action

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-900/80 border-b border-surface-800">
      {/* ── Mode indicator & selector ─────────────────── */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowModePicker(!showModePicker)}
          className="flex items-center gap-1 px-2 py-0.5 text-2xs font-medium rounded bg-surface-800 text-surface-300 hover:bg-surface-700 transition-colors"
          title={`当前模式: ${mode}`}
        >
          <span>{MODE_LABELS[mode] || mode}</span>
        </button>

        {showModePicker && (
          <div className="absolute left-0 top-full mt-1 w-36 bg-surface-900 border border-surface-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {(['autonomous', 'observe', 'governed'] as RuntimeMode[]).map((m) => (
              <button
                key={m}
                onClick={async () => {
                  setShowModePicker(false)
                  setMode(m)
                  try {
                    await setTaskMode(taskId, m)
                  } catch {
                    /* optimistic UI */
                  }
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-2xs text-left transition-colors ${
                  mode === m
                    ? 'bg-accent-600/15 text-accent-400'
                    : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-surface-700" />

      {/* ── Status label ──────────────────────────────── */}
      <span className="text-2xs text-surface-500 mr-1">
        {humanOverride
          ? '🖐 已接管'
          : paused
            ? '⏸ 已暂停'
            : '▶ 自主运行中'}
      </span>

      {/* ── Control buttons ───────────────────────────── */}
      {/* Pause — only visible when NOT paused/overridden */}
      {!hasControl && (
        <button
          onClick={() => call('pause', () => pauseTask(taskId))}
          disabled={isLoading('pause')}
          className="flex items-center gap-1 px-2 py-0.5 text-2xs font-medium text-surface-400 hover:text-surface-200 bg-surface-800 hover:bg-surface-700 rounded transition-colors disabled:opacity-50"
        >
          ⏸ 暂停
        </button>
      )}

      {/* Take Over — only when not already overridden */}
      {!humanOverride && (
        <button
          onClick={() => call('takeover', () => takeOverTask(taskId))}
          disabled={isLoading('takeover')}
          className="flex items-center gap-1 px-2 py-0.5 text-2xs font-medium text-warning hover:text-warning bg-warning/10 hover:bg-warning/20 border border-warning/30 rounded transition-colors disabled:opacity-50"
        >
          🖐 接管
        </button>
      )}

      {/* Resume — only visible when paused */}
      {hasControl && (
        <button
          onClick={() => call('resume', () => resumeTask(taskId))}
          disabled={isLoading('resume')}
          className="flex items-center gap-1 px-2 py-0.5 text-2xs font-medium text-success hover:text-success bg-success/10 hover:bg-success/20 border border-success/30 rounded transition-colors disabled:opacity-50"
        >
          ▶ 继续
        </button>
      )}

      {/* Rollback */}
      <button
        onClick={() => call('rollback', () => rollbackTask(taskId))}
        disabled={isLoading('rollback')}
        className="flex items-center gap-1 px-2 py-0.5 text-2xs font-medium text-surface-400 hover:text-surface-200 bg-surface-800 hover:bg-surface-700 rounded transition-colors disabled:opacity-50"
      >
        ↩ 回滚
      </button>

      {/* Stop */}
      <button
        onClick={() => call('stop', () => stopTask(taskId))}
        disabled={isLoading('stop')}
        className="flex items-center gap-1 px-2 py-0.5 text-2xs font-medium text-error hover:text-error bg-error/10 hover:bg-error/20 border border-error/30 rounded transition-colors disabled:opacity-50"
      >
        ⏹ 停止
      </button>
    </div>
  )
}
