/** ForgeShell: Command-Centre layout for ForgeX Studio.
 *
 *  ┌───────────────────────────────────────────────────────────┐
 *  │  TopBar                                    🌙 设置        │
 *  ├───────┬───────────────────────────┬───────────────────────┤
 *  │       │                           │                       │
 *  │  Left  │    CenterWorkspace       │  RightInspector       │
 *  │Sidebar │   (Activity Stream)      │  (Tabbed Panels)      │
 *  │        │                           │                       │
 *  ├───────┴───────────────────────────┴───────────────────────┤
 *  │  UserInput (textarea + mode selector + execute)           │
 *  ├───────────────────────────────────────────────────────────┤
 *  │  StatusBar: Runtime | Task | Phase | EVI | Token          │
 *  └───────────────────────────────────────────────────────────┘
 *
 *  v0.2.1 — Real Runtime connection via REST + SSE.
 *  Falls back to mock events when Runtime is unavailable.
 */
import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../stores/runtime'
import { TopBar } from '../components/TopBar'
import { LeftSidebar } from '../components/LeftSidebar'
import { CenterWorkspace } from '../components/CenterWorkspace'
import { RightInspector } from '../components/RightInspector'
import { StatusBar } from '../components/StatusBar'
import { abortMockStream, useMockStream } from '../mock/stream'
import { getHealth, createTask } from '../api/forge'

let _id_seq = 0
function uid(): string {
  _id_seq++
  return `ev-${Date.now().toString(36)}-${_id_seq}`
}

export function ForgeShell() {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const addEvent = useStore((s) => s.addEvent)
  const connect = useStore((s) => s.connect)
  const disconnect = useStore((s) => s.disconnect)
  const isConnected = useStore((s) => s.isConnected)

  // Check Runtime availability on mount
  const [runtimeAvail, setRuntimeAvail] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    getHealth()
      .then(() => {
        if (!cancelled) setRuntimeAvail(true)
      })
      .catch(() => {
        if (!cancelled) {
          setRuntimeAvail(false)
          // Runtime not available — show demo on welcome screen
          useStore.setState({ events: [], tasks: [] })
        }
      })
    return () => { cancelled = true }
  }, [])

  // Play mock demo ONLY when Runtime is confirmed unavailable
  useMockStream(runtimeAvail === false)

  const handleSend = useCallback(
    async (message: string, mode: string) => {
      if (!message.trim()) return

      try {
        abortMockStream()
        disconnect()
        useStore.setState({ events: [], tasks: [], selectedTaskId: null })

        addEvent({
          kind: 'user_message',
          task_id: uid(),
          event_id: uid(),
          timestamp: new Date().toISOString(),
          payload: { message, mode },
        })

        const result = await createTask(message)
        connect(result.task_id)
      } catch (e) {
        console.warn('Runtime unavailable, using mock fallback:', e)
        const taskId = uid()
        addEvent({
          kind: 'task_started',
          task_id: taskId,
          event_id: uid(),
          timestamp: new Date().toISOString(),
          payload: { goal: message, intent: mode, intent_confidence: 0.9 },
        })
      }
    },
    [addEvent, connect, disconnect],
  )

  return (
    <div className="h-screen flex flex-col bg-surface-950 text-surface-200">
      <TopBar
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => setLeftOpen((v) => !v)}
        onToggleRight={() => setRightOpen((v) => !v)}
      />

      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar collapsed={!leftOpen} />
        <CenterWorkspace onSend={handleSend} />
        <RightInspector
          collapsed={!rightOpen}
          onToggle={() => setRightOpen(false)}
        />
      </div>

      <StatusBar />
    </div>
  )
}
