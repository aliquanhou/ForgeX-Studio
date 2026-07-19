# ForgeX Studio

**Local Development Console for ForgeX Agent OS**

ForgeX Studio 不是聊天 UI。它是一个用于运行、观察、调试、扩展 ForgeX Runtime 的 IDE 类前端平台。

## Architecture

```
ForgeX Studio (React + Vite + TypeScript)
    │
    ├── Runtime Timeline      ← 实时事件流
    ├── Decision Inspector    ← 决策引擎状态
    ├── World Model Viewer    ← 知识图谱可视化
    ├── Memory Console        ← 四层记忆面板
    ├── Tool Execution        ← 工具调用追踪
    ├── Artifact / Diff       ← 变更审阅
    └── Plugin Manager        ← 扩展管理
    │
    └── SSE ──── ForgeX Runtime (FastAPI)
```

## 7 Panels

| Panel | 用途 |
|-------|------|
| **Runtime Timeline** | 显示任务全生命周期 events |
| **Decision Inspector** | EVI 指标、Knowledge Coverage、决策理由 |
| **World Model Viewer** | Facts、架构层、影响分析 |
| **Memory Console** | 四层记忆状态 |
| **Tool Execution** | 工具调用实时追踪 |
| **Artifact / Diff** | 制品生命周期、变更对比 |
| **Plugin Manager** | 内核信息、插件安装管理 |

## Quick Start

```bash
# Install dependencies
npm install

# Development server (proxies /api to ForgeX runtime)
npm run dev

# Production build
npm run build
```

## Design

- **Event-Driven UI**: Runtime 通过 SSE 推送 events，UI 自动更新
- **No polling**: 前端不轮询，完全被动接收
- **Panel-based layout**: 7 个独立面板，可自由开关组合
- **Dark theme**: 深色主题，专注代码操作

## Stack

- React 19 + TypeScript
- Vite 5
- Tailwind CSS 3
- Zustand (state management)
- Lucide React (icons)
- SSE (Server-Sent Events)
