import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import {
  NAV_LINKS,
  CONTACT_EMAIL,
  SITE_NAME,
  SITE_TAGLINE,
  HERO_IMAGE,
} from '../data/site'
import { useBodyScrollLock } from '../hooks/usePointerSwipe'
import { cx } from '../utils/dom'
import ebLogo from '../assets/brand/eb-logo.png'

const HEADER = {
  light: 'sticky top-0 z-40 bg-white/85 backdrop-blur-md',
  paper:
    'sticky top-0 z-40 bg-[color-mix(in_srgb,var(--paper-warm)_90%,transparent)] backdrop-blur-md',
  dark: 'sticky top-0 z-40 bg-[color-mix(in_srgb,var(--darkroom)_90%,transparent)] backdrop-blur-md',
  immersive: 'absolute inset-x-0 top-0 z-10',
  hero: 'absolute inset-x-0 top-0 z-10',
}

function EbLogo({ className, invert = false }) {
  return (
    <img
      src={ebLogo}
      alt={SITE_NAME}
      className={cx('eb-logo', invert && 'eb-logo--invert', className)}
      width={44}
      height={44}
      decoding="async"
    />
  )
}

export default function Navbar({ variant = 'hero' }) {
  const [open, setOpen] = useState(false)
  const darkText = variant === 'light' || variant === 'paper'
  const ink = darkText ? 'text-black' : 'text-white'

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const menu =
    typeof document !== 'undefined' &&
    createPortal(
      <div
        id="mobile-nav"
        className={cx('mobile-menu', open && 'is-open')}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
      >
        <div className="mobile-menu__bg" aria-hidden="true">
          <img src={HERO_IMAGE} alt="" decoding="async" />
          <div className="mobile-menu__scrim" />
        </div>

        <div className="mobile-menu__top">
          <Link to="/" onClick={() => setOpen(false)} aria-label={SITE_NAME}>
            <EbLogo className="mobile-menu__mark" />
          </Link>
          <button
            type="button"
            className="mobile-menu__close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={26} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mobile-menu__brand" aria-hidden="true">
          <p className="mobile-menu__name">
            {SITE_NAME.split(' ')[0]}
            <br />
            {SITE_NAME.split(' ').slice(1).join(' ')}
          </p>
          <p className="mobile-menu__role">{SITE_TAGLINE.split(' / ')[0]}</p>
        </div>

        <nav className="mobile-menu__nav" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cx('mobile-menu__link', isActive && 'is-active')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <a href={`mailto:${CONTACT_EMAIL}`} className="mobile-menu__email">
          {CONTACT_EMAIL}
        </a>
      </div>,
      document.body
    )

  return (
    <header className={HEADER[variant] || HEADER.hero}>
      <div className="mx-auto flex max-w-[1340px] items-center justify-between py-7 px-[15px] mobile:px-[18px] mobile:py-5 md-tablet:px-[18px] md-tablet:py-6">
        <Link
          to="/"
          className="eb-logo-link"
          aria-label={SITE_NAME}
        >
          <EbLogo className="mobile-header__mark" invert={darkText} />
        </Link>

        <nav
          className={cx(
            'hidden items-center gap-8 not-mobile:flex md-tablet:gap-5',
            ink
          )}
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className="nav-link-underline"
            >
              <span className="nav-link__label uppercase">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className={cx(
            'ml-auto flex h-10 w-10 items-center justify-center not-mobile:hidden',
            ink
          )}
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {menu}
    </header>
  )
}
