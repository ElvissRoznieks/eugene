import Navbar from './Navbar'
import HeroBackground from './HeroBackground'
import ImdbBar from './ImdbBar'
import ImdbFab from './ImdbFab'
import PageFade from './PageFade'

/**
 * Reveal footer: dock is fixed to the viewport bottom (z behind content).
 * Opaque chrome scrolls over it; a transparent spacer at the end uncovers it.
 */
const SHELL = {
  hero: {
    root: 'relative h-screen overflow-hidden bg-black text-white',
    nav: 'hero',
    dock: null,
    fade: false,
    heroBg: true,
    revealDock: false,
    chromeClass: 'relative z-[2] h-screen bg-transparent',
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

export default function Layout({ children, variant = 'light' }) {
  const shell = SHELL[variant] || SHELL.light

  return (
    <div className={shell.root}>
      {shell.dock ? <ImdbBar variant={shell.dock} /> : null}

      <div className={shell.chromeClass}>
        {shell.heroBg ? <HeroBackground /> : null}
        <Navbar variant={shell.nav} />
        {shell.heroBg ? (
          <div className="relative z-[2] h-screen">{children}</div>
        ) : (
          <main className={shell.mainClass}>
            {shell.fade ? <PageFade>{children}</PageFade> : children}
          </main>
        )}
      </div>

      {shell.revealDock ? (
        <div className="site-dock-spacer" aria-hidden="true" />
      ) : null}

      {variant === 'hero' || variant === 'immersive' ? null : <ImdbFab />}
    </div>
  )
}
