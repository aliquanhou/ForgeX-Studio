# ForgeX Studio — Version Manifest

> **ForgeX v0.3.3 标志着系统从"可解释 Agent"进入"可治理的自主工程操作系统"阶段。默认自主执行、全程可观测、随时可接管、结果可回滚，构成了 ForgeX 的核心运行时契约（Runtime Contract）。**

---

## 版本演进

| 版本 | 主题 | 完成时间 |
|------|------|----------|
| v0.1 | Agent IDE — 7 面板 Dashboard | 2026-07-20 |
| v0.2 | 命令中心布局 — 产品形态转型 | 2026-07-20 |
| v0.2.1 | Runtime 真实连接（REST + SSE） | 2026-07-20 |
| v0.3.0 | 认知渲染层（Cognitive Rendering Layer） | 2026-07-20 |
| v0.3.1 | 上下文绑定（Inspector Data Binding） | 2026-07-20 |
| v0.3.2 | 工程叙事压缩（Narrative Compression） | 2026-07-20 |
| v0.3.3 | **自主控制层（Autonomous Control Layer）** | 2026-07-20 |

下一跳：v0.4.0 认知重定向（Cognitive Redirection）

---

## 架构成熟度（v0.3.3 审计结论）

| 维度 | 评分 | 说明 |
|------|------|------|
| 认知能力 | 8.8 | CRL + Narrative Compression |
| 控制能力 | 9.4 | Pause/Resume/TakeOver/Rollback/Stop + 3 Modes |
| 可观测性 | 9.3 | SSE + Agent Stream + Inspector |
| 可逆性 | 9.5 | Snapshot + Rollback |
| 架构边界清晰度 | 9.6 | 三层完全解耦 |

**结论：已跨过架构探索期，进入真实工程验证期。**

---

## 三层架构

```
【认知层】  LLM / Planner / Decision
    ↓
【控制层】  Runtime / Budget / Pause / TakeOver / Rollback
    ↓
【表现层】  Studio / Narrative / Inspector / ControlBar
```

这三层已完全解耦：
- 换模型（DeepSeek → Qwen）不影响控制层
- 换 UI（Web → 桌面）不影响 Runtime
- 接机器人（ROS2）不影响认知层

---

## 运行时契约（Runtime Contract）

1. **默认自主** — Agent 连续自主执行，人类是观察者
2. **全程可观测** — 每步决策通过 SSE 实时推送到 Studio
3. **随时可接管** — Pause / TakeOver / Redirect（v0.4）
4. **结果可回滚** — Snapshot 级可逆，不影响后续任务

---

## 控制矩阵

| 能力 | 状态 | 版本 |
|------|------|------|
| 🟢 观察 Observe | ✅ | v0.3.3 |
| ⏸ 暂停 Pause | ✅ | v0.3.3 |
| ▶ 恢复 Resume | ✅ | v0.3.3 |
| 🖐 接管 Take Over | ✅ | v0.3.3 |
| ↩ 回滚 Rollback | ✅ | v0.3.3 |
| ⏹ 终止 Stop | ✅ | v0.3.3 |
| 🧭 重定向 Redirect | ⬜ | v0.4.0 |

---

## 核心品牌哲学

> ForgeX 不是一个要求人类不断批准 AI 的系统，而是一个默认赋予 AI 最大工程行动自由、同时赋予人类随时夺回方向盘能力的自主工程操作系统。

---

## 产品定义

ForgeX Studio = **Runtime-Governed Autonomous Engineering System**

不是 AI IDE，不是 Agent Platform——而是基于工程叙事流（Engineering Narrative）的 AI 工程协作工作台。
