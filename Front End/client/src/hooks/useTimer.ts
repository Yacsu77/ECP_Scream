import { useEffect, useRef, useState, useCallback } from 'react'

interface UseTimerOptions {
  duration: number
  onTick?: (elapsed: number, remaining: number) => void
  onComplete?: () => void
}

interface UseTimerReturn {
  elapsed: number
  remaining: number
  progress: number
  isRunning: boolean
  start: () => void
  stop: () => void
  reset: () => void
}

export function useTimer({ duration, onTick, onComplete }: UseTimerOptions): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const onTickRef = useRef(onTick)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { onTickRef.current = onTick }, [onTick])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return

    const now = performance.now()
    const newElapsed = now - startTimeRef.current

    if (newElapsed >= duration) {
      setElapsed(duration)
      setIsRunning(false)
      startTimeRef.current = null
      onTickRef.current?.(duration, 0)
      onCompleteRef.current?.()
      return
    }

    setElapsed(newElapsed)
    onTickRef.current?.(newElapsed, duration - newElapsed)
    rafRef.current = requestAnimationFrame(tick)
  }, [duration])

  const start = useCallback(() => {
    if (isRunning) return
    startTimeRef.current = performance.now()
    setIsRunning(true)
    setElapsed(0)
    rafRef.current = requestAnimationFrame(tick)
  }, [isRunning, tick])

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    startTimeRef.current = null
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setElapsed(0)
  }, [stop])

  useEffect(() => () => { stop() }, [stop])

  const remaining = Math.max(0, duration - elapsed)
  const progress = Math.min(1, elapsed / duration)

  return { elapsed, remaining, progress, isRunning, start, stop, reset }
}
