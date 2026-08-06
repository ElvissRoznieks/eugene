import Navbar from './Navbar'
import HeroBackground from './HeroBackground'
import ImdbBar from './ImdbBar'
import ImdbFab from './ImdbFab'
import PageFade from './PageFade'

const SHELL = {
  hero: {
    root: 'relative h-screen overflow-hidden bg-black text-white',
    nav: 'hero',
    dock: 'light',
    fade: false,
    heroBg: true,
    mainClass: 'relative z-[2] h-screen',
  },
  immersive: {
    root: 'layout-shell layout-shell--immersive relative min-h-screen',
    nav: 'immersive',
    dock: 'light',
    fade: false,
    heroBg: false,
    mainClass: 'relative z-[1]',
  },
  dark: {
    root: 'layout-shell layout-shell--dark flow-site relative min-h-screen',
    nav: 'dark',
    dock: 'dark',
    fade: true,
    heroBg: false,
    mainClass: 'pb-24',
  },
  paper: {
    root: 'layout-shell layout-shell--paper flow-site relative min-h-screen',
    nav: 'paper',
    dock: 'light',
    fade: true,
    heroBg: false,
    mainClass: 'pb-24',
  },
  light: {
    root: 'layout-shell layout-shell--light flow-site relative min-h-screen',
    nav: 'light',
    dock: 'light',
    fade: true,
    heroBg: false,
    mainClass: 'pb-24',
  },
}

export default function Layout({ children, variant = 'light' }) {
  const shell = SHELL[variant] || SHELL.light

  return (
    <div className={shell.root}>
      {shell.heroBg ? <HeroBackground /> : null}
      <Navbar variant={shell.nav} />
      {shell.heroBg ? (
        <div className={shell.mainClass}>{children}</div>
      ) : (
        <main className={shell.mainClass}>
          {shell.fade ? <PageFade>{children}</PageFade> : children}
        </main>
      )}
      <ImdbFab />
      <ImdbBar variant={shell.dock} />
    </div>
  )
}
