/** Agent Stream 消息类型定义 */

export type MessageType =
  | 'user_message'  // 用户输入
  | 'intent'        // 意图分类
  | 'plan'          // 计划生成
  | 'thought'       // 思考/推理过程
  | 'decision'      // 决策（含 EVI）
  | 'tool'          // 工具调用
  | 'world_update'  // 知识/世界模型更新
  | 'artifact'      // 制品产出
  | 'completion'    // 任务完成
  | 'error'         // 错误
  | 'phase_header'  // 阶段过渡标签

export type MessageStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface AgentMessage {
  id: string
  type: MessageType
  status: MessageStatus
  timestamp: string
  /** 原始事件 payload 数据，各卡片按需提取 */
  data: Record<string, unknown>
  /** 是否是最新到达的消息（用于入场动画） */
  isFresh?: boolean
}

export interface AgentMessageProps {
  message: AgentMessage
  isLatest?: boolean
  onSelect?: (type: MessageType, id: string) => void
}
