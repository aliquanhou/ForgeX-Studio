import { create } from 'zustand'

export interface ForgeEvent {
  kind: string
  payload: Record<string, unknown>
  task_id: string
  event_id: string
  timestamp: string
}

export interface TaskState {
  taskId: string
  goal: string
  phase: string
  round: number
  isRunning: boolean
  success: boolean | null
}

interface RuntimeState {
  tasks: TaskState[]
  events: ForgeEvent[]
  selectedTaskId: string | null
  isConnected: boolean
  eventSource: EventSource | null

  // Panels visibility
  visiblePanels: Record<string, boolean>

  addEvent: (event: ForgeEvent) => void
  setSelectedTask: (id: string | null) => void
  connect: (taskId?: string) => void
  disconnect: () => void
  togglePanel: (panel: string) => void
}

export const useStore = create<RuntimeState>((set, get) => ({
  tasks: [],
  events: [],
  selectedTaskId: null,
  isConnected: false,
  eventSource: null,
  visiblePanels: {
    timeline: true,
    decision: true,
    worldModel: true,
    memory: true,
    tools: true,
    artifact: false,
    plugins: false,
  },

  addEvent: (event) => {
    set((state) => ({
      events: [...state.events.slice(-500), event],
    }))

    // Derive task state from events
    const state = get()
    if (event.kind === 'task_started') {
      set((s) => ({
        tasks: [
          ...s.tasks,
          {
            taskId: event.task_id,
            goal: (event.payload.goal as string) || '',
            phase: 'init',
            round: 0,
            isRunning: true,
            success: null,
          },
        ],
        selectedTaskId: state.selectedTaskId || event.task_id,
      }))
    } else if (event.kind === 'task_completed' || event.kind === 'task_failed') {
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.taskId === event.task_id
            ? { ...t, isRunning: false, success: event.kind === 'task_completed' }
            : t
        ),
      }))
    } else if (event.kind === 'action_selected') {
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.taskId === event.task_id
            ? { ...t, phase: (event.payload.action as string) || t.phase, round: t.round + 1 }
            : t
        ),
      }))
    }
  },

  setSelectedTask: (id) => set({ selectedTaskId: id }),

  connect: (taskId) => {
    const state = get()
    if (state.eventSource) {
      state.eventSource.close()
    }

    // Connect directly to Runtime (not via Vite proxy) to avoid SSE proxy issues
    const base = 'http://localhost:5173/api'
    const url = taskId ? `${base}/tasks/${taskId}/events` : `${base}/tasks/events`
    const es = new EventSource(url)

    es.onopen = () => {
      if (get().eventSource === es) {
        set({ isConnected: true, eventSource: es })
      }
    }

    es.onmessage = (e) => {
      try {
        const event: ForgeEvent = JSON.parse(e.data)
        get().addEvent(event)
      } catch { /* ignore parse errors */ }
    }

    // Don't call es.close() on error — EventSource auto-reconnects.
    // Only update state if this EventSource is still the current one,
    // guarding against stale callbacks from a previously-disconnected ES.
    es.onerror = () => {
      if (get().eventSource === es) {
        set({ isConnected: false })
      }
    }
  },

  disconnect: () => {
    const state = get()
    if (state.eventSource) {
      state.eventSource.close()
    }
    set({ isConnected: false, eventSource: null })
  },

  togglePanel: (panel) =>
    set((state) => ({
      visiblePanels: { ...state.visiblePanels, [panel]: !state.visiblePanels[panel] },
    })),
}))
