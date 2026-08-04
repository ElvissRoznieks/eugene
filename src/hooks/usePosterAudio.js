import { useEffect, useRef } from 'react'

/**
 * Plays the focused poster's audio when soundOn is true.
 * Fades between tracks when the active film changes.
 */
export default function usePosterAudio(audioSrc, soundOn) {
  const audioRef = useRef(null)
  const fadeRef = useRef(null)

  useEffect(() => {
    function clearFade() {
      if (fadeRef.current) {
        window.clearInterval(fadeRef.current)
        fadeRef.current = null
      }
    }

    function stopCurrent(fadeMs = 280) {
      const current = audioRef.current
      if (!current) return
      clearFade()
      const startVol = current.volume
      const steps = 8
      let i = 0
      fadeRef.current = window.setInterval(() => {
        i += 1
        current.volume = Math.max(0, startVol * (1 - i / steps))
        if (i >= steps) {
          clearFade()
          current.pause()
          current.src = ''
          if (audioRef.current === current) audioRef.current = null
        }
      }, fadeMs / steps)
    }

    if (!soundOn || !audioSrc) {
      stopCurrent()
      return undefined
    }

    clearFade()
    const prev = audioRef.current
    if (prev) {
      prev.pause()
      prev.src = ''
    }

    const next = new Audio(audioSrc)
    next.loop = true
    next.preload = 'auto'
    next.volume = 0
    audioRef.current = next

    let cancelled = false
    const restart = () => {
      if (cancelled || audioRef.current !== next) return
      next.loop = true
      try {
        next.currentTime = 0
      } catch {
        /* ignore seek errors on some codecs */
      }
      next.play().catch(() => {})
    }

    // Some m4a sources ignore the loop attribute — force a seamless restart
    next.addEventListener('ended', restart)
    next.addEventListener('loadedmetadata', () => {
      next.loop = true
    })

    next
      .play()
      .then(() => {
        if (cancelled) {
          next.pause()
          return
        }
        next.loop = true
        const target = 0.42
        const steps = 10
        let i = 0
        clearFade()
        fadeRef.current = window.setInterval(() => {
          i += 1
          next.volume = Math.min(target, target * (i / steps))
          if (i >= steps) clearFade()
        }, 30)
      })
      .catch(() => {
        // Autoplay blocked or missing file — stay silent
      })

    return () => {
      cancelled = true
      next.removeEventListener('ended', restart)
      clearFade()
      next.pause()
      next.src = ''
      if (audioRef.current === next) audioRef.current = null
    }
  }, [audioSrc, soundOn])

  useEffect(() => {
    return () => {
      if (fadeRef.current) window.clearInterval(fadeRef.current)
      const current = audioRef.current
      if (current) {
        current.pause()
        current.src = ''
      }
    }
  }, [])
}
