import imdbLogo from '../assets/imdb-logo.webp'
import { IMDB_PRO_URL, SITE_NAME } from '../data/site'

/** Fixed corner IMDb Pro badge */
export default function ImdbFab() {
  return (
    <a
      href={IMDB_PRO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="imdb-fab"
      aria-label={`${SITE_NAME} on IMDb Pro`}
      title="IMDb Pro"
    >
      <img
        src={imdbLogo}
        alt="IMDb"
        className="imdb-fab__logo"
        width={575}
        height={290}
        decoding="async"
        loading="lazy"
      />
    </a>
  )
}
