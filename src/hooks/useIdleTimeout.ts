'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseIdleTimeoutOptions {
  timeout: number // timeout in milliseconds
  onTimeout: () => void
  enabled?: boolean
  events?: string[]
}

export function useIdleTimeout({
  timeout,
  onTimeout,
  enabled = true,
  events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'wheel'
  ]
}: UseIdleTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const onTimeoutRef = useRef(onTimeout)

  // Update the timeout callback ref when it changes
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        onTimeoutRef.current()
      }, timeout)
    }
  }, [timeout, enabled])

  const handleActivity = useCallback(() => {
    resetTimeout()
  }, [resetTimeout])

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Set initial timeout
    resetTimeout()

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [enabled, events, handleActivity, resetTimeout])

  // Manual reset function
  const reset = useCallback(() => {
    resetTimeout()
  }, [resetTimeout])

  // Clear timeout function
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  return { reset, clear }
}