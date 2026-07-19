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
 */
import { useCallback, useState } from 'react'
import { useStore } from '../stores/runtime'
import { TopBar } from '../components/TopBar'
import { LeftSidebar } from '../components/LeftSidebar'
import { CenterWorkspace } from '../components/CenterWorkspace'
import { RightInspector } from '../components/RightInspector'
import { UserInput } from '../components/UserInput'
import { StatusBar } from '../components/StatusBar'
import { abortMockStream, useMockStream } from '../mock/stream'

let _id_seq = 0
function uid(): string {
  _id_seq++
  return `ev-${Date.now().toString(36)}-${_id_seq}`
}

export function ForgeShell() {
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const addEvent = useStore((s) => s.addEvent)

  // Phase 0.5: Mock event stream on first mount
  useMockStream()

  const handleSend = useCallback(
    (message: string, mode: string) => {
      if (!message.trim()) return

      try {
        // Stop mock, reset store
        abortMockStream()
        useStore.setState({ events: [], tasks: [] })

        // Insert user message
        addEvent({
          kind: 'user_message',
          task_id: uid(),
          event_id: uid(),
          timestamp: new Date().toISOString(),
          payload: { message, mode },
        })

        // Start task
        const taskId = uid()
        addEvent({
          kind: 'task_started',
          task_id: taskId,
          event_id: uid(),
          timestamp: new Date().toISOString(),
          payload: { goal: message, intent: mode, intent_confidence: 0.9 },
        })
      } catch (e) {
        console.error('handleSend error:', e)
      }
    },
    [addEvent],
  )

  return (
    <div className="h-screen flex flex-col bg-surface-950 text-surface-200">
      <TopBar
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => setLeftOpen((v) => !v)}
        onToggleRight={() => setRightOpen((v) => !v)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Three-column content area */}
        <div className="flex-1 flex overflow-hidden">
          <LeftSidebar collapsed={!leftOpen} />
          <CenterWorkspace />
          <RightInspector
            collapsed={!rightOpen}
            onToggle={() => setRightOpen(false)}
          />
        </div>

        {/* User input */}
        <UserInput onSend={handleSend} />
      </div>

      <StatusBar />
    </div>
  )
}
