import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'
import { SITE_NAME, navByPath } from '../data/site'
import ebMark from '../assets/brand/eb-mark.png'
import scriptLogo from '../assets/brand/eugene-brady-script.png'

const YEAR = new Date().getFullYear()
const homePath = navByPath('/')?.path || '/'

const TONE = {
  hero: 'site-dock--hero',
  gallery: 'site-dock--gallery',
  light: 'site-dock--ink',
  dark: 'site-dock--ink',
}

export default function ImdbBar({ variant = 'hero' }) {
  const tone = TONE[variant] || TONE.hero

  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <footer className={`site-dock ${tone}`}>
      <div className="site-dock__row page-shell">
        <Link to={homePath} className="site-dock__brand" aria-label={SITE_NAME}>
          <img
            src={ebMark}
            alt=""
            className="site-dock__mark"
            width={40}
            height={40}
            decoding="async"
          />
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

        <button
          type="button"
          className="site-dock__top"
          onClick={scrollTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <ChevronUp size={16} strokeWidth={1.75} />
        </button>
      </div>
    </footer>
  )
}
