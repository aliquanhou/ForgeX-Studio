/** User input area: styled textarea with mode selector, file attachment, quick actions. */
import { useState, useCallback, useRef, useEffect } from 'react'
import { Play, Paperclip, ChevronDown } from 'lucide-react'

const USER_MODES = [
  { id: 'conversation', label: '对话' },
  { id: 'analysis', label: '分析' },
  { id: 'coding', label: '编程' },
  { id: 'auto', label: '自动执行' },
] as const

const EXPERT_MODES = [
  { id: 'debug', label: 'Debug' },
  { id: 'world', label: 'World Model' },
  { id: 'runtime', label: 'Runtime控制' },
  { id: 'plugin', label: 'Plugin开发' },
] as const

const QUICK_ACTIONS = ['分析架构', '修复 Bug', '生成文档', '重构代码']

interface UserInputProps {
  onSend: (message: string, mode: string) => void
}

export function UserInput({ onSend }: UserInputProps) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('conversation')
  const [showPicker, setShowPicker] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = taRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
    }
  }, [input])

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text) return
    onSend(text, mode)
    setInput('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }, [input, mode, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const allModes = [...USER_MODES, ...EXPERT_MODES]
  const currentMode = allModes.find((m) => m.id === mode)
  const isExpert = EXPERT_MODES.some((m) => m.id === mode)

  return (
    <div className="bg-surface-950 border-t border-surface-800">
      <div className="px-4 py-3">
        {/* ── Input box ─────────────────────────────── */}
        <div className="bg-surface-900 border border-surface-700 rounded-lg focus-within:border-accent-500/50 transition-colors overflow-hidden">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="告诉 ForgeX 你想完成什么..."
            rows={2}
            className="w-full bg-transparent text-sm text-surface-200 placeholder-surface-600 outline-none resize-none px-4 pt-3 pb-2 font-sans leading-relaxed"
          />

          {/* ── Actions bar ─────────────────────────── */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-surface-800/50">
            <div className="flex items-center gap-2">
              {/* Attachment */}
              <button className="flex items-center gap-1 px-2 py-1 text-2xs text-surface-500 hover:text-surface-300 hover:bg-surface-800 rounded transition-colors">
                <Paperclip className="w-3 h-3" />
                <span>附件</span>
              </button>

              {/* Mode selector */}
              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="flex items-center gap-1.5 px-2 py-1 text-2xs text-surface-500 hover:text-surface-300 hover:bg-surface-800 rounded transition-colors"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isExpert ? 'bg-surface-600' : mode === 'auto' ? 'bg-warning' : 'bg-accent-400'}`}
                  />
                  <span>{currentMode?.label || '对话'}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {showPicker && (
                  <div className="absolute bottom-full left-0 mb-1 w-44 bg-surface-900 border border-surface-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-1.5 text-2xs text-surface-500 border-b border-surface-800">
                      普通模式
                    </div>
                    {USER_MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setMode(m.id)
                          setShowPicker(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                          mode === m.id
                            ? 'bg-accent-600/15 text-accent-400'
                            : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${m.id === 'auto' ? 'bg-warning' : 'bg-accent-400'}`}
                        />
                        {m.label}
                      </button>
                    ))}
                    <div className="px-3 py-1.5 text-2xs text-surface-500 border-y border-surface-800">
                      专家模式
                    </div>
                    {EXPERT_MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setMode(m.id)
                          setShowPicker(false)
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                          mode === m.id
                            ? 'bg-accent-600/15 text-accent-400'
                            : 'text-surface-400 hover:bg-surface-800 hover:text-surface-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-surface-600" />
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xs text-surface-600 hidden sm:inline">⌘↵ 发送</span>

              {/* Execute button */}
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-accent-600 hover:bg-accent-500 disabled:bg-surface-700 disabled:text-surface-500 text-white rounded-lg transition-colors"
              >
                <Play className="w-3 h-3" />
                执行
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick action chips ────────────────────── */}
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="text-2xs text-surface-600">快速:</span>
          {QUICK_ACTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s, mode)}
              className="px-2 py-0.5 text-2xs text-surface-500 bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50 rounded transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
