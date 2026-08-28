import missingBrendanPoster from '../assets/posters/missing-brendan.webp'
import theNephewPoster from '../assets/posters/the-nephew.webp'
import theGirlWhoStayedPoster from '../assets/posters/the-girl-who-stayed.webp'

export const NAV_LINKS = [
  { index: '01', label: 'Home', path: '/' },
  { index: '02', label: 'Film', path: '/film' },
  { index: '03', label: 'Photography', path: '/photography' },
  { index: '04', label: 'About', path: '/about' },
  { index: '05', label: 'Contact', path: '/contact' },
]

export const IMDB_URL = 'https://www.imdb.com/name/nm0103622/'
export const IMDB_PRO_URL = 'https://pro.imdb.com/name/nm0103622/'
export const LINKEDIN_URL = 'https://www.linkedin.com/in/eugene-brady-a89b1278/'
export const INSTAGRAM_URL = 'https://www.instagram.com/eugene.brady/'

export const SOCIAL_LINKS = [
  { id: 'linkedin', label: 'LinkedIn', href: LINKEDIN_URL },
  { id: 'instagram', label: 'Instagram', href: INSTAGRAM_URL },
  { id: 'imdb', label: 'IMDb', href: IMDB_PRO_URL },
]

export const CONTACT_EMAIL = 'info@eugenebrady.com'
/** Update with the real number when available */
export const CONTACT_PHONE = '+353 87 000 0000'
export const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE.replace(/\s+/g, '')}`

export const SITE_URL = 'https://eugenebrady.com'
export const SITE_HOST = 'eugenebrady.com'
export const SITE_NAME = 'Eugene Brady'
export const SITE_TAGLINE = 'Director / Photographer'
export const SITE_NATIONALITY = 'Irish'
export const SITE_CITY = 'Dublin'
export const SITE_TZ = 'Europe/Dublin'
export const SITE_LOCATION_LINE = 'Based · Ireland · International'
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`

/** Full-bleed home still — public so HTML can preload for LCP */
export const HERO_IMAGE = '/hero.webp'
export const HERO_IMAGE_ALT = 'Eugene Brady — cinematic opening still'

export const DEFAULT_ATMOSPHERE = '/audio/default-atmosphere.m4a'

/** Top-level stills only: assets/movies/{Film Name}/{n}.webp */
const movieStillModules = import.meta.glob('../../assets/movies/*/*.webp', {
  eager: true,
  import: 'default',
})

function filmGallery(folder, title, order) {
  const items = Object.entries(movieStillModules)
    .filter(([path]) => path.includes(`/movies/${folder}/`))
    .map(([path, src]) => {
      const n = Number((path.match(/(\d+)\.webp$/i) || [])[1] || 0)
      return { n, src }
    })

  const sorted = order?.length
    ? order
        .map((n) => items.find((item) => item.n === n))
        .filter(Boolean)
        .concat(items.filter((item) => !order.includes(item.n)))
    : items.sort((a, b) => a.n - b.n)

  return sorted.map(({ n, src }, i) => {
    const id = String(n || i + 1).padStart(2, '0')
    return {
      id,
      src,
      title: `${title} · ${id}`,
      caption: `Still ${id}`,
      alt: `${title} — production still ${id}`,
    }
  })
}

export const FILMS = [
  {
    title: 'The Nephew',
    titleLines: ['The', 'Nephew'],
    year: '1998',
    index: '01',
    imdb: 'https://pro.imdb.com/title/tt0119772/?ref_=nmovr_t_1',
    synopsis:
      'A young Black American arrives on a remote Irish island to honour his mother’s dying wish, forcing a family and a community built on buried secrets to confront the past.',
    credits: 'Starring Pierce Brosnan',
    rating: 6.5,
    ratingOutOf: 10,
    audio: null,
    poster: theNephewPoster,
    imageAlt:
      'The Nephew movie poster — Donal McCann, Pierce Brosnan, Sinead Cusack',
    gallery: filmGallery('The Nephew', 'The Nephew', [5, 6, 1, 2, 3, 4]),
    galleryPoster: 'last',
  },
  {
    title: 'Missing Brendan',
    titleLines: ['Missing', 'Brendan'],
    year: '2003',
    index: '02',
    imdb: 'https://pro.imdb.com/title/tt0311530/?ref_=nmovr_i_2',
    synopsis:
      'Thirty years after the Vietnam War, an aging father travels to Vietnam with his reluctant family to uncover the fate of the son he never stopped searching for, only to discover that some truths are harder to live with than never knowing.',
    credits: 'Starring Adam Brody',
    rating: 6.2,
    ratingOutOf: 10,
    audio: null,
    poster: missingBrendanPoster,
    imageAlt:
      'Missing Brendan movie poster — Edward Asner, Adam Brody, Illeana Douglas',
    gallery: filmGallery('Missing Brendan', 'Missing Brendan', [1, 2, 3, 4, 5, 6]),
    galleryPoster: 'last',
  },
  {
    title: 'The Girl Who Stayed',
    titleLines: ['The Girl', 'Who Stayed'],
    year: 'In Development',
    index: '03',
    imdb: null,
    synopsis:
      'The Girl Who Stayed is an intimate drama with subtle otherworldly elements about Emily, a fifteen-year-old girl caught between worlds after her death. When she discovers that the father she never knew was never told she existed, Emily quietly draws him back into the life of her grieving mother. But as every attempt to reach him costs her a little more of her own presence, Emily must discover that being loved may mean finally learning to let go.',
    credits: 'Currently in Development',
    inDevelopment: true,
    rating: null,
    ratingOutOf: 10,
    audio: null,
    poster: theGirlWhoStayedPoster,
    imageAlt:
      'The Girl Who Stayed concept art — coastal path under storm light',
    gallery: [],
  },
]

/** Photography selects: assets/gallery/{n}.webp — order matches Page 4 light table */
const photoModules = import.meta.glob('../../assets/gallery/*.webp', {
  eager: true,
  import: 'default',
})

const PHOTO_ORDER = [
  // Row 1 unchanged; rows 2 ↔ 3 swapped (desktop 3-up)
  21, 19, 20, 13, 10, 6, 3, 5, 17, 15, 2, 1, 11, 7, 18, 12, 14, 8,
]

const PHOTO_SPANS = ['tall', 'wide', 'square', 'tall', 'wide', 'square']

const photoByNumber = Object.fromEntries(
  Object.entries(photoModules).map(([path, image]) => {
    const n = Number((path.match(/(\d+)\.webp$/i) || [])[1] || 0)
    return [n, image]
  }),
)

export const GALLERY = PHOTO_ORDER.filter((n) => photoByNumber[n]).map(
  (fileN, i) => {
    const n = String(i + 1).padStart(2, '0')
    return {
      id: n,
      title: `Study ${n}`,
      category: 'Portrait',
      year: 'Select',
      note: null,
      span: PHOTO_SPANS[i % PHOTO_SPANS.length],
      imageAlt: `Photographic portrait study ${n} by ${SITE_NAME}`,
      image: photoByNumber[fileN],
    }
  },
)

export const ABOUT_HEADSHOT = '/brady-headshot.webp'
export const ABOUT_HEADSHOT_ALT =
  'Portrait of Eugene Brady, Irish director and photographer'

export const PHOTO_LEDE =
  'Photography that approaches people and places with a cinematic eye, blurring the line between photography and cinema.'

export const CONTACT_ENQUIRIES = [
  { id: 'Directing', prompt: 'For directing and narrative enquiries.' },
  { id: 'Development', prompt: 'For development, financing and partnership notes.' },
]

export const ABOUT_BIO = [
  'Eugene Brady is an Irish filmmaker and photographer whose work explores grief, family, identity and memory through intimate character drama and cinematic portraiture.',
  'Drawn to emotionally authentic stories with a strong visual atmosphere, his films are grounded in performance and stillness, revealing the tensions that exist beneath everyday life.',
  'A BAFTA member, Brady directed The Nephew, starring Pierce Brosnan, and Missing Brendan, starring Adam Brody. He has worked internationally across the United States, Europe and Australia, and is currently developing his next feature film, The Girl Who Stayed.',
  '“I make films about the families we inherit, the people we lose, and the memories that continue to shape us.”',
  'His photography approaches people and places with a cinematic eye, blurring the line between photography and cinema.',
]

/** @deprecated use ABOUT_BIO — kept for any leftover imports */
export const ABOUT_CHAPTERS = [
  {
    id: 'bio',
    role: 'Director',
    label: '01 / Bio',
    paragraphs: ABOUT_BIO,
  },
]

/** "A, B, and C" from a list of titles */
export function formatTitleList(titles) {
  if (!titles?.length) return ''
  if (titles.length === 1) return titles[0]
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`
  return `${titles.slice(0, -1).join(', ')}, and ${titles[titles.length - 1]}`
}

export const FILM_TITLES_INLINE = formatTitleList(FILMS.map((f) => f.title))

export const SITE_DEFAULT_DESCRIPTION = `${SITE_NAME} — ${SITE_NATIONALITY.toLowerCase()} director and photographer exploring grief, family, identity and memory. Films include ${FILM_TITLES_INLINE}.`

export const SITE_OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_TAGLINE}`

export function navByPath(path) {
  return NAV_LINKS.find((link) => link.path === path)
}

export function pageKicker(path) {
  const link = navByPath(path)
  return link ? `${link.index} / ${link.label}` : ''
}

export function sitePath(path = '/') {
  if (!path || path === '/') return SITE_URL
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function mailSubject(label) {
  return `[${SITE_HOST}] ${label}`
}

export const PAGE_SEO = {
  home: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DEFAULT_DESCRIPTION,
    path: '/',
    image: SITE_OG_IMAGE,
    imageAlt: SITE_OG_IMAGE_ALT,
  },
  film: {
    title: 'Film',
    description: `Films by ${SITE_NAME} — ${FILM_TITLES_INLINE}. Synopses, posters and stills from features including The Nephew and Missing Brendan.`,
    path: '/film',
    image: SITE_OG_IMAGE,
    imageAlt: `Film posters by ${SITE_NAME}`,
  },
  photography: {
    title: 'Photography',
    description: `Photography by ${SITE_NAME} — ${PHOTO_LEDE}`,
    path: '/photography',
    image: SITE_OG_IMAGE,
    imageAlt: `Portrait photography by ${SITE_NAME}`,
  },
  about: {
    title: 'About',
    description: `About ${SITE_NAME} — ${SITE_NATIONALITY} director and photographer, BAFTA member. Films include ${FILM_TITLES_INLINE}.`,
    path: '/about',
    image: ABOUT_HEADSHOT,
    imageAlt: ABOUT_HEADSHOT_ALT,
    preloadLcp: true,
  },
  contact: {
    title: 'Contact',
    description: `Contact ${SITE_NAME} for directing, photography and development enquiries — ${CONTACT_EMAIL}`,
    path: '/contact',
    image: SITE_OG_IMAGE,
    imageAlt: SITE_OG_IMAGE_ALT,
  },
}
