/** Phase 0.5 -- Mock event stream hook.
 *  Pushes mock events into the runtime store with realistic delays.
 *  Call abortMockStream() to cancel playback.
 *
 *  Usage:
 *    useMockStream()              // auto-start on mount (original behavior)
 *    useMockStream(true)          // conditional: start when true
 *    useMockStream(runtimeAvail === false)  // only when Runtime is unavailable
 */

import { useEffect } from 'react'
import { useStore } from '../stores/runtime'
import { MOCK_EVENTS } from './events'

let _abort = false

export function abortMockStream() {
  _abort = true
}

export function useMockStream(condition?: boolean) {
  const addEvent = useStore((s) => s.addEvent)

  const shouldRun = condition === undefined ? true : condition

  useEffect(() => {
    if (!shouldRun) return

    _abort = false
    // Reset store so each mount (incl. StrictMode remount) starts clean
    useStore.setState({ events: [], tasks: [] })

    let cancelled = false

    const run = async () => {
      for (let i = 0; i < MOCK_EVENTS.length; i++) {
        if (cancelled || _abort) break

        const ev = MOCK_EVENTS[i]
        const delay = i === 0 ? 300 : Math.min(
          Math.max(
            (new Date(ev.timestamp).getTime() - new Date(MOCK_EVENTS[i - 1].timestamp).getTime()),
            200
          ),
          1200
        )

        await new Promise((r) => setTimeout(r, delay))
        if (cancelled || _abort) break

        addEvent(ev)
      }
    }

    run()
    return () => { cancelled = true }
  }, [addEvent, shouldRun])
}
