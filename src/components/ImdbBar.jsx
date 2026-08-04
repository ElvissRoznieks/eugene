import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, SITE_NAME, navByPath } from '../data/site'

const YEAR = new Date().getFullYear()
const contactPath = navByPath('/contact')?.path || '/contact'

export default function ImdbBar({ variant = 'hero' }) {
  const light = variant === 'light' || variant === 'hero'

  return (
    <footer
      className={`site-dock ${light ? 'site-dock--light' : 'site-dock--dark'}`}
    >
      <div className="site-dock__row page-shell">
        <span className="site-dock__copy">
          © {YEAR} {SITE_NAME}
        </span>
        <a href={`mailto:${CONTACT_EMAIL}`} className="site-dock__link">
          {CONTACT_EMAIL}
        </a>
        <Link to={contactPath} className="site-dock__link site-dock__link--end">
          Contact
        </Link>
      </div>
    </footer>
  )
}
