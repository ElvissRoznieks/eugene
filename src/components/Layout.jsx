import { lazy, Suspense, useEffect } from 'react'
import Navbar from './Navbar'
import ImdbBar from './ImdbBar'
import PageFade from './PageFade'

const HeroBackground = lazy(() => import('./HeroBackground'))

/**
 * Reveal footer: dock is fixed to the viewport bottom (z behind content).
 * Opaque chrome scrolls over it; a transparent spacer at the end uncovers it.
 */
const SHELL = {
  hero: {
    root: 'layout-shell layout-shell--home relative h-[100svh] max-h-[100svh] overflow-hidden bg-transparent text-white',
    nav: 'hero',
    dock: null,
    fade: false,
    heroBg: true,
    revealDock: false,
    chromeClass:
      'relative z-[2] flex h-full max-h-full min-h-0 flex-col overflow-hidden bg-transparent',
  },
  immersive: {
    root: 'layout-shell layout-shell--immersive relative h-screen overflow-hidden',
    nav: 'immersive',
    dock: null,
    fade: false,
    heroBg: false,
    revealDock: false,
    chromeClass: 'relative z-[2] h-screen overflow-hidden bg-[var(--darkroom)]',
    mainClass: 'h-full overflow-hidden',
  },
  dark: {
    root: 'layout-shell layout-shell--dark flow-site relative min-h-screen',
    nav: 'dark',
    dock: 'dark',
    fade: true,
    heroBg: false,
    revealDock: true,
    chromeClass: 'relative z-[2] bg-[var(--darkroom)]',
    mainClass: undefined,
  },
  paper: {
    root: 'layout-shell layout-shell--paper flow-site relative min-h-screen',
    nav: 'paper',
    dock: 'light',
    fade: true,
    heroBg: false,
    revealDock: true,
    chromeClass: 'relative z-[2] bg-[var(--paper-warm)]',
    mainClass: undefined,
  },
  light: {
    root: 'layout-shell layout-shell--light flow-site relative min-h-screen',
    nav: 'light',
    dock: 'light',
    fade: true,
    heroBg: false,
    revealDock: true,
    chromeClass: 'relative z-[2] bg-[var(--paper)]',
    mainClass: undefined,
  },
}

export default function Layout({
  children,
  variant = 'light',
  dock,
  dockBrand = true,
  dockImdb = true,
}) {
  const shell = SHELL[variant] || SHELL.light
  const lockHome = variant === 'hero'
  const dockVariant = dock === false ? null : shell.dock
  const revealDock = dock === false ? false : shell.revealDock

  useEffect(() => {
    if (!lockHome) return undefined
    const root = document.documentElement
    root.classList.add('is-home-lock')
    return () => root.classList.remove('is-home-lock')
  }, [lockHome])

  useEffect(() => {
    const el = document.querySelector('.boot-hero')
    if (!el) return
    const show = variant === 'hero'
    el.classList.toggle('is-done', !show)
    el.toggleAttribute('aria-hidden', !show)
  }, [variant])

  return (
    <div className={shell.root}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {dockVariant ? (
        <ImdbBar
          variant={dockVariant}
          brand={dockBrand}
          imdb={dockImdb}
        />
      ) : null}

      <div className={shell.chromeClass}>
        {shell.heroBg ? (
          <Suspense fallback={null}>
            <HeroBackground />
          </Suspense>
        ) : null}
        <Navbar variant={shell.nav} />
        {shell.heroBg ? (
          <div
            id="main-content"
            className="relative z-[2] min-h-0 flex-1 overflow-hidden"
            tabIndex={-1}
          >
            {children}
          </div>
        ) : (
          <main id="main-content" className={shell.mainClass} tabIndex={-1}>
            {shell.fade ? <PageFade>{children}</PageFade> : children}
          </main>
        )}
      </div>

      {revealDock ? (
        <div className="site-dock-spacer" aria-hidden="true" />
      ) : null}
    </div>
  )
}
