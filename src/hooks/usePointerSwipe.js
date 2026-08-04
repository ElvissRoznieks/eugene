import { useCallback, useEffect, useRef } from 'react'

/**
 * Horizontal swipe → onSwipe(-1 | 1). Ignores presses that start on button/a.
 */
export function useHorizontalSwipe(onSwipe, { threshold = 48 } = {}) {
  const swipeRef = useRef({ active: false, x: 0, dx: 0 })
  const onSwipeRef = useRef(onSwipe)
  onSwipeRef.current = onSwipe

  const onPointerDown = useCallback((e) => {
    if (e.target.closest?.('button, a')) return
    swipeRef.current = { active: true, x: e.clientX, dx: 0 }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!swipeRef.current.active) return
    swipeRef.current.dx = e.clientX - swipeRef.current.x
  }, [])

  const onPointerUp = useCallback(() => {
    if (!swipeRef.current.active) return
    const { dx } = swipeRef.current
    swipeRef.current.active = false
    if (Math.abs(dx) < threshold) return
    onSwipeRef.current?.(dx < 0 ? 1 : -1)
  }, [threshold])

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
}

/** Lock document body scroll while `locked` is true. */
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}
