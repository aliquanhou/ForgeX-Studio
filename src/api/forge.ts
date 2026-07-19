import type { ForgeEvent } from '../stores/runtime'

const BASE = '/api'

export async function createTask(goal: string, tokenBudget = 100000, roundLimit = 50) {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, token_budget: tokenBudget, round_limit: roundLimit }),
  })
  return res.json()
}

export async function listTasks() {
  const res = await fetch(`${BASE}/tasks`)
  return res.json()
}

export async function getTask(taskId: string) {
  const res = await fetch(`${BASE}/tasks/${taskId}`)
  return res.json()
}

export async function getHealth() {
  const res = await fetch(`${BASE}/health`)
  return res.json()
}

export async function listTools() {
  const res = await fetch(`${BASE}/tools`)
  return res.json()
}

export function connectSSE(taskId: string, onEvent: (event: ForgeEvent) => void): EventSource {
  const es = new EventSource(`${BASE}/tasks/${taskId}/events`)
  es.onmessage = (e) => {
    try {
      const event: ForgeEvent = JSON.parse(e.data)
      onEvent(event)
    } catch { /* ignore */ }
  }
  return es
}
