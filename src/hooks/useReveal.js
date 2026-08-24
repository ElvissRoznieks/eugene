import { useEffect, useRef, useState } from 'react'

export default function useReveal(threshold = 0.15, { immediate = false } = {}) {
  const ref = useRef(null)
  // Always start hidden so CSS transitions can run (even for immediate)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return undefined
    }

    if (immediate) {
      // Double rAF so the browser paints the hidden state first
      let raf2 = 0
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setVisible(true))
      })
      return () => {
        cancelAnimationFrame(raf1)
        cancelAnimationFrame(raf2)
      }
    }

    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(node)

    // Defer the in-view check so it doesn't sync-flush layout after React's commit
    const raf = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        setVisible(true)
        observer.disconnect()
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [threshold, immediate])

  return { ref, visible }
}
