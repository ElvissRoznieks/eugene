import { Link } from 'react-router-dom'
import { IMDB_PRO_URL, SITE_NAME, navByPath } from '../data/site'
import scriptLogo from '../assets/brand/eugene-brady-script.webp'
import imdbLogo from '../assets/imdb-logo.webp'
import { cx } from '../utils/dom'

const YEAR = new Date().getFullYear()
const homePath = navByPath('/')?.path || '/'

const TONE = {
  hero: 'site-dock--hero',
  gallery: 'site-dock--gallery',
  light: 'site-dock--paper',
  dark: 'site-dock--ink',
}

export default function ImdbBar({
  variant = 'hero',
  brand = true,
  imdb = true,
}) {
  const tone = TONE[variant] || TONE.hero
  const copyOnly = !brand && !imdb

  return (
    <footer
      className={cx('site-dock', tone, copyOnly && 'site-dock--copy-only')}
    >
      <div className="site-dock__row page-shell">
        {brand ? (
          <Link to={homePath} className="site-dock__brand" aria-label={SITE_NAME}>
            <img
              src={scriptLogo}
              alt={SITE_NAME}
              className="site-dock__script"
              width={92}
              height={22}
              decoding="async"
              loading="lazy"
            />
          </Link>
        ) : null}

        <p className="site-dock__copy">
          © {YEAR} by {SITE_NAME} and respective clients. All rights reserved.
        </p>

        {imdb ? (
          <nav className="site-dock__socials" aria-label="IMDb">
            <a
              href={IMDB_PRO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="site-dock__social site-dock__social--imdb"
              aria-label={`${SITE_NAME} on IMDb`}
              title="IMDb"
            >
              <img
                src={imdbLogo}
                alt="IMDb"
                className="site-dock__imdb-logo"
                width={575}
                height={290}
                decoding="async"
                loading="lazy"
              />
            </a>
          </nav>
        ) : null}
      </div>
    </footer>
  )
}
