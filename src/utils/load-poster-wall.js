/**
 * Load PosterWall (Three.js) fully off the critical path.
 * Shell + loading icon paint first; the heavy chunk waits for an idle slot.
 */

function yieldToMain() {
  return new Promise((resolve) => {
    if (typeof globalThis.scheduler?.yield === 'function') {
      globalThis.scheduler.yield().then(resolve, () => setTimeout(resolve, 0))
      return
    }
    setTimeout(resolve, 0)
  })
}

function whenIdle(timeout = 1200) {
  return new Promise((resolve) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => resolve(), { timeout })
      return
    }
    window.setTimeout(resolve, 48)
  })
}

function afterPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

/**
 * @param {{ signal?: AbortSignal, onPhase?: (phase: string) => void }} [opts]
 * @returns {Promise<typeof import('../components/PosterWall').default>}
 */
export async function loadPosterWallAsync({ signal, onPhase } = {}) {
  const check = () => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  }

  onPhase?.('paint')
  await afterPaint()
  check()

  onPhase?.('idle')
  await whenIdle(900)
  check()

  await yieldToMain()
  check()

  onPhase?.('fetch')
  // Dynamic import: download + parse happen here, after the loader is on screen
  const mod = await import('../components/PosterWall')
  check()

  onPhase?.('mount')
  await yieldToMain()
  check()

  return mod.default
}
