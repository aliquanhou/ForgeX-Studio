# ForgeX Studio

**AI Engineering Command Center**

ForgeX Studio 是一个 Agent IDE，为 ForgeX Runtime 提供类 Claude Code / Cursor 的交互界面。

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│ TopBar: 项目 / 任务导航            ● Runtime状态  设置       │
├──────┬─────────────────────────┬────────────────────────────┤
│      │                         │                            │
│ Left │   CenterWorkspace       │  RightInspector            │
│Sidebar│   (Agent 活动流)        │  (6个标签: 任务/决策/世界/  │
│      │                         │   记忆/工具/插件)           │
│ 项目 │   💬 用户对话气泡         │                            │
│ 任务  │   ▶ Task 执行追踪        │                            │
│ 插件  │   ⚡ 工具调用记录         │                            │
├──────┴─────────────────────────┴────────────────────────────┤
│ UserInput: [文本输入区]  [📎附件] [对话▼] [▶ 执行]            │
│           快速: 分析架构 修复Bug 生成文档 重构代码              │
├─────────────────────────────────────────────────────────────┤
│ StatusBar: ●Runtime在线 | 任务:... | 阶段:EXECUTE | EVI | ✅ │
└─────────────────────────────────────────────────────────────┘
```

## Architecture

```
ForgeX Studio (React + Vite + TypeScript)
    │
    ├── TopBar           ← 导航、Runtime 状态
    ├── LeftSidebar      ← 项目文件、任务历史、插件
    ├── CenterWorkspace  ← Agent 活动流（核心工作区）
    ├── RightInspector   ← 智能控制中心（6 标签页）
    ├── UserInput        ← 增强输入框（模式选择、附件）
    └── StatusBar        ← 紧凑指标栏
    │
    └── SSE ──── ForgeX Runtime (FastAPI)
```

## Modes

| 模式 | 用途 |
|------|------|
| **对话** | 普通交互模式 |
| **分析** | 专注代码/项目分析 |
| **编程** | 编码任务优先 |
| **自动执行** | 全自动执行 |
| **Debug** | 调试 Runtime |
| **World Model** | 世界模型可视化 |
| **Runtime控制** | 内核级别控制 |
| **Plugin开发** | 插件开发模式 |

## Quick Start

```bash
npm install
npm run dev        # 开发服务器 -> http://localhost:5174
npm run build      # 生产构建
npm run preview    # 预览构建产物
```

## Stack

- React 19 + TypeScript
- Vite 5
- Tailwind CSS 3
- Zustand (state management)
- Lucide React (icons)
- SSE (Server-Sent Events)
