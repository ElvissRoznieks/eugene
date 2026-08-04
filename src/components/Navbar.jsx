import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import {
  NAV_LINKS,
  CONTACT_EMAIL,
  IMDB_URL,
  SITE_CITY,
} from '../data/site'
import useDublinClock from '../hooks/useDublinClock'
import { cx } from '../utils/dom'

const HEADER = {
  light: 'sticky top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur-md',
  paper:
    'sticky top-0 z-40 border-b border-black/10 bg-[color-mix(in_srgb,var(--paper-warm)_90%,transparent)] backdrop-blur-md',
  dark: 'sticky top-0 z-40 border-b border-white/10 bg-[color-mix(in_srgb,var(--darkroom)_90%,transparent)] backdrop-blur-md',
  immersive: 'absolute inset-x-0 top-0 z-10',
  hero: 'absolute inset-x-0 top-0 z-10',
}

const PANEL = {
  light: 'border-black/10 bg-white',
  paper: 'border-black/10 bg-[var(--paper-warm)]',
  dark: 'border-white/10 bg-[color-mix(in_srgb,var(--darkroom)_95%,transparent)] backdrop-blur-md',
  immersive: 'border-white/10 bg-black/90 backdrop-blur-md',
  hero: 'border-white/10 bg-black/90 backdrop-blur-md',
}

export default function Navbar({ variant = 'hero' }) {
  const [open, setOpen] = useState(false)
  const time = useDublinClock()
  const darkText =
    variant === 'light' || variant === 'immersive' || variant === 'paper'
  const ink = darkText ? 'text-black' : 'text-white'
  const muted = darkText ? 'text-black/45' : 'text-white/70'

  return (
    <header className={HEADER[variant] || HEADER.hero}>
      <div className="mx-auto flex max-w-[1340px] items-start justify-between py-7 px-[15px] mobile:px-[18px] mobile:py-5 md-tablet:px-[18px] md-tablet:py-6">
        <nav
          className={cx('hidden items-center gap-7 not-mobile:flex md-tablet:gap-4', ink)}
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className="nav-link-underline"
            >
              <span
                className={cx(
                  'text-[8px] font-medium uppercase leading-3 tracking-[-0.08px]',
                  muted
                )}
              >
                {link.index}
              </span>
              <span className="text-xs font-medium uppercase leading-4 tracking-[-0.12px]">
                / {link.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div
          className={cx(
            'hidden flex-col items-end gap-1 not-mobile:flex',
            ink
          )}
        >
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xs font-medium uppercase leading-4 tracking-[-0.12px] transition-opacity hover:opacity-70"
          >
            {CONTACT_EMAIL}
          </a>
          <p
            className={cx(
              'text-[8px] font-medium uppercase leading-3 tracking-[-0.08px]',
              muted
            )}
            aria-live="polite"
            aria-label={`${SITE_CITY} time`}
          >
            {SITE_CITY.slice(0, 3).toUpperCase()} {time}
          </p>
        </div>

        <button
          type="button"
          className={cx(
            'ml-auto flex h-10 w-10 items-center justify-center not-mobile:hidden',
            ink
          )}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cx(
          'mobile-panel border-t',
          PANEL[variant] || PANEL.hero,
          open && 'is-open'
        )}
      >
        <div className="mobile-panel-inner" inert={!open ? true : undefined}>
          <nav
            className={cx('flex flex-col gap-5 px-[18px] py-8', ink)}
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setOpen(false)}
                className="text-[28px] font-medium uppercase leading-8 tracking-[-0.84px]"
              >
                <span
                  className={cx(
                    'mr-3',
                    darkText ? 'text-black/35' : 'text-white/40'
                  )}
                >
                  {link.index}
                </span>
                {link.label}
              </NavLink>
            ))}
            <div
              className={cx(
                'mt-4 flex flex-col gap-2 border-t pt-5',
                darkText ? 'border-black/10' : 'border-white/10'
              )}
            >
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm font-medium uppercase tracking-[-0.12px]"
              >
                {CONTACT_EMAIL}
              </a>
              <a
                href={IMDB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(
                  'text-sm font-medium uppercase tracking-[-0.12px]',
                  darkText ? 'text-black/55' : 'text-white/70'
                )}
              >
                IMDb Profile
              </a>
              <p
                className={cx(
                  'text-[10px] font-medium uppercase tracking-[-0.08px]',
                  darkText ? 'text-black/40' : 'text-white/50'
                )}
              >
                {SITE_CITY.slice(0, 3).toUpperCase()} {time}
              </p>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
