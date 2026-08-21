import { Link } from 'react-router-dom'
import { SITE_NAME, SOCIAL_LINKS, navByPath } from '../data/site'
import scriptLogo from '../assets/brand/eugene-brady-script.png'

const YEAR = new Date().getFullYear()
const homePath = navByPath('/')?.path || '/'

const TONE = {
  hero: 'site-dock--hero',
  gallery: 'site-dock--gallery',
  light: 'site-dock--ink',
  dark: 'site-dock--ink',
}

function LinkedinIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.06c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.07V23h-4v-6.6c0-1.57-.03-3.59-2.19-3.59-2.19 0-2.53 1.71-2.53 3.48V23h-4V8.5z"
        transform="translate(1.2 0.5) scale(0.9)"
      />
    </svg>
  )
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="12"
        r="4.1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="17.35" cy="6.65" r="1.15" fill="currentColor" />
    </svg>
  )
}

function ImdbGlyph({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" fill="#f5c518" />
      <text
        x="12"
        y="14.6"
        textAnchor="middle"
        fill="#0a0a0a"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="7.2"
        fontWeight="800"
        letterSpacing="-0.4"
      >
        IMDb
      </text>
    </svg>
  )
}

const SOCIAL_ICONS = {
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  imdb: ImdbGlyph,
}

export default function ImdbBar({ variant = 'hero' }) {
  const tone = TONE[variant] || TONE.hero

  return (
    <footer className={`site-dock ${tone}`}>
      <div className="site-dock__row page-shell">
        <Link to={homePath} className="site-dock__brand" aria-label={SITE_NAME}>
          <img
            src={scriptLogo}
            alt={SITE_NAME}
            className="site-dock__script"
            height={22}
            decoding="async"
          />
        </Link>

        <p className="site-dock__copy">
          © {YEAR} by {SITE_NAME} and respective clients. All rights reserved.
        </p>

        <nav className="site-dock__socials" aria-label="Social">
          {SOCIAL_LINKS.map((link) => {
            const Icon = SOCIAL_ICONS[link.id]
            return (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-dock__social"
                aria-label={link.label}
                title={link.label}
              >
                {Icon ? <Icon size={18} /> : link.label}
              </a>
            )
          })}
        </nav>
      </div>
    </footer>
  )
}
