import { useEffect, useRef, useState } from 'react'

export default function useReveal(threshold = 0.15, { immediate = false } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(immediate)

  useEffect(() => {
    if (immediate) {
      setVisible(true)
      return undefined
    }

    const node = ref.current
    if (!node) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return undefined
    }

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

    // Catch already-in-view elements on first paint
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      setVisible(true)
      observer.disconnect()
    }

    return () => observer.disconnect()
  }, [threshold, immediate])

  return { ref, visible }
}
