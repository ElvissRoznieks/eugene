import heroHome from '../assets/home.webp'
import missingBrendanPoster from '../assets/posters/missing-brendan.png'
import theNephewPoster from '../assets/posters/the-nephew.png'
import theGirlWhoStayedPoster from '../assets/posters/the-girl-who-stayed.png'
import bradyHeadshot from '../assets/brady-headshot.png'

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

/** Full-bleed home still */
export const HERO_IMAGE = heroHome
export const HERO_IMAGE_ALT = 'Eugene Brady — cinematic opening still'

export const DEFAULT_ATMOSPHERE = '/audio/default-atmosphere.m4a'

/** Top-level stills only: assets/movies/{Film Name}/{n}.webp */
const movieStillModules = import.meta.glob('../../assets/movies/*/*.webp', {
  eager: true,
  import: 'default',
})

function filmGallery(folder, title) {
  return Object.entries(movieStillModules)
    .filter(([path]) => path.includes(`/movies/${folder}/`))
    .sort(([a], [b]) => {
      const na = Number((a.match(/(\d+)\.webp$/i) || [])[1] || 0)
      const nb = Number((b.match(/(\d+)\.webp$/i) || [])[1] || 0)
      return na - nb
    })
    .map(([, src], i) => {
      const n = String(i + 1).padStart(2, '0')
      return {
        id: n,
        src,
        title: `${title} · ${n}`,
        caption: `Still ${n}`,
        alt: `${title} — production still ${n}`,
      }
    })
}

export const FILMS = [
  {
    title: 'The Nephew',
    year: '1998',
    index: '01',
    imdb: 'https://pro.imdb.com/title/tt0119772/?ref_=nmovr_t_1',
    synopsis:
      'A young Black American arrives on a remote Irish island to honour his mother’s dying wish, forcing a family—and a community built on buried secrets—to confront the past.',
    credits: 'Starring Pierce Brosnan',
    rating: 6.5,
    ratingOutOf: 10,
    audio: null,
    poster: theNephewPoster,
    imageAlt:
      'The Nephew movie poster — Donal McCann, Pierce Brosnan, Sinead Cusack',
    gallery: filmGallery('The Nephew', 'The Nephew'),
  },
  {
    title: 'Missing Brendan',
    year: '2003',
    index: '02',
    imdb: 'https://pro.imdb.com/title/tt0311530/?ref_=nmovr_i_2',
    synopsis:
      'Thirty years after the Vietnam War, an aging father returns to Vietnam with his reluctant family to uncover the fate of the son he never stopped searching for—only to discover that some truths are harder to live with than never knowing.',
    credits: 'Starring Adam Brody',
    rating: 6.2,
    ratingOutOf: 10,
    audio: null,
    poster: missingBrendanPoster,
    imageAlt:
      'Missing Brendan movie poster — Edward Asner, Adam Brody, Illeana Douglas',
    gallery: filmGallery('Missing Brendan', 'Missing Brendan'),
  },
  {
    title: 'The Girl Who Stayed',
    year: 'In Development',
    index: '03',
    imdb: null,
    synopsis:
      'A grieving mother, a broken writer, and the ghost of the daughter he never knew must confront the truth that binds them before she can finally move on.',
    credits: 'Currently in Development',
    inDevelopment: true,
    rating: null,
    ratingOutOf: 10,
    audio: null,
    poster: theGirlWhoStayedPoster,
    imageAlt:
      'The Girl Who Stayed concept art — coastal path under storm light',
    gallery: filmGallery('The Girl Who Stayed', 'The Girl Who Stayed'),
  },
]

/** Photography selects: assets/gallery/{n}.webp — order matches Page 4 light table */
const photoModules = import.meta.glob('../../assets/gallery/*.webp', {
  eager: true,
  import: 'default',
})

const PHOTO_ORDER = [
  13, 10, 6, 3, 5, 17, 11, 7, 18, 16, 9, 1, 12, 14, 8, 15, 2, 4,
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
      imageAlt: `Portrait study ${n} by ${SITE_NAME}`,
      image: photoByNumber[fileN],
    }
  },
)

export const ABOUT_HEADSHOT = bradyHeadshot
export const ABOUT_HEADSHOT_ALT =
  'Outdoor portrait of Eugene Brady against a blue sky, looking toward the light'

export const PHOTO_LEDE =
  'Portrait studies approached as characters—still frames that carry the weight of a scene.'

export const CONTACT_ENQUIRIES = [
  { id: 'Directing', prompt: 'For directing and narrative enquiries.' },
  { id: 'Development', prompt: 'For development, financing and partnership notes.' },
]

export const ABOUT_CHAPTERS = [
  {
    id: 'voice',
    role: 'Director',
    label: '01 / Voice',
    paragraphs: [
      `${SITE_NAME} is an Irish director and photographer whose work explores grief, identity, family and the quiet moments that shape our lives.`,
      'Working between narrative cinema and portraiture, Brady is drawn to stories that balance emotional realism with strong visual atmosphere.',
    ],
  },
  {
    id: 'approach',
    role: 'Photographer',
    label: '02 / Approach',
    paragraphs: [
      'His films are often grounded in performance, stillness and character—frames that feel lived-in before a line is spoken.',
      'Alongside filmmaking, he develops photographic portrait studies that approach subjects as characters—blurring photography and cinema.',
    ],
  },
  {
    id: 'work',
    role: 'BAFTA member',
    label: '03 / Work',
    paragraphs: [
      `A BAFTA member, Brady directed The Nephew, starring Pierce Brosnan, and Missing Brendan, starring Adam Brody. He has worked internationally across the United States, Europe and Australia and is currently developing The Girl Who Stayed.`,
    ],
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
  },
  film: {
    title: 'Film',
    description: `Wall of Fame — films by ${SITE_NAME} including ${FILM_TITLES_INLINE}. Interactive gallery with posters, synopses and credits.`,
    path: '/film',
    image: SITE_OG_IMAGE,
  },
  photography: {
    title: 'Photography',
    description: `Portraiture by ${SITE_NAME} — ${PHOTO_LEDE}`,
    path: '/photography',
    image: GALLERY[0]?.image,
  },
  about: {
    title: 'About',
    description: `About ${SITE_NAME} — ${SITE_NATIONALITY} director and photographer, BAFTA member. Films include ${FILM_TITLES_INLINE}.`,
    path: '/about',
    image: SITE_OG_IMAGE,
  },
  contact: {
    title: 'Contact',
    description: `Contact ${SITE_NAME} for directing, photography or development enquiries — ${CONTACT_EMAIL}`,
    path: '/contact',
    image: SITE_OG_IMAGE,
  },
}
