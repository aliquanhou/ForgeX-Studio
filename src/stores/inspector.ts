/** Inspector store: 管理右侧面板的消息选中状态和动态内容。 */
import { create } from 'zustand'
import type { AgentMessage, MessageType } from '../agent-stream/MessageTypes'

export type InspectorTab = 'task' | 'decision' | 'world' | 'memory' | 'tools' | 'plugins'

interface InspectorState {
  /** 当前选中的消息 ID */
  selectedMessageId: string | null
  /** 当前选中的消息类型 */
  selectedType: MessageType | null
  /** 当前选中的消息 payload */
  payload: Record<string, unknown> | null
  /** 当前激活的标签页 */
  activeTab: InspectorTab
  /** 是否正在显示来自卡片点击的详情 */
  isDetailView: boolean

  /** 打开 Inspector 并跳转到指定标签 */
  openInspector: (opts: {
    type: MessageType
    id: string
    payload: Record<string, unknown>
    tab: InspectorTab
  }) => void

  /** 关闭详情视图（回到标签默认内容） */
  closeDetail: () => void

  /** 直接切换标签 */
  setTab: (tab: InspectorTab) => void
}

export const useInspectorStore = create<InspectorState>((set) => ({
  selectedMessageId: null,
  selectedType: null,
  payload: null,
  activeTab: 'task',
  isDetailView: false,

  openInspector: ({ type, id, payload, tab }) =>
    set({
      selectedMessageId: id,
      selectedType: type,
      payload,
      activeTab: tab,
      isDetailView: true,
    }),

  closeDetail: () =>
    set({
      selectedMessageId: null,
      selectedType: null,
      payload: null,
      isDetailView: false,
    }),

  setTab: (tab) => set({ activeTab: tab }),
}))
