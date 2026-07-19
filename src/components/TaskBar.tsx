import { useStore } from '../stores/runtime'

export function TaskBar() {
  const tasks = useStore((s) => s.tasks)
  const selectedTaskId = useStore((s) => s.selectedTaskId)
  const setSelectedTask = useStore((s) => s.setSelectedTask)

  if (tasks.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-surface-900 border-b overflow-x-auto">
      {tasks.map((task) => (
        <button
          key={task.taskId}
          onClick={() => setSelectedTask(task.taskId)}
          className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
            selectedTaskId === task.taskId
              ? 'bg-accent-600/20 text-accent-400'
              : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${
            task.isRunning ? 'bg-success animate-pulse' : task.success ? 'bg-success' : task.success === false ? 'bg-error' : 'bg-surface-600'
          }`} />
          <span className="max-w-[120px] truncate">{task.goal}</span>
          <span className="text-2xs text-surface-500">r{task.round}</span>
        </button>
      ))}
    </div>
  )
}
