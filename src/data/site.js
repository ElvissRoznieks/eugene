import heroSea from '../assets/hero-sea.png'
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
export const CONTACT_EMAIL = 'hello@eugenebrady.com'

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
export const HERO_IMAGE = heroSea
export const HERO_IMAGE_ALT = 'Ocean waves under open sky'

export const DEFAULT_ATMOSPHERE = '/audio/default-atmosphere.m4a'

export const FILMS = [
  {
    title: 'The Girl Who Stayed',
    year: 'In Development',
    index: '01',
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
  },
  {
    title: 'The Nephew',
    year: '1998',
    index: '02',
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
  },
  {
    title: 'Missing Brendan',
    year: '2003',
    index: '03',
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
  },
]

export const GALLERY = [
  {
    id: '01',
    title: 'Man Reaching',
    category: 'Study',
    year: 'Select',
    note: 'Gesture as character.',
    span: 'tall',
    imageAlt:
      'Photographic study Man Reaching — figure extending an arm in dramatic light',
    image:
      'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '02',
    title: 'Clock',
    category: 'Still Life',
    year: 'Select',
    note: 'Time held in frame.',
    span: 'wide',
    imageAlt: 'Still life photograph of a clock face — time held in frame',
    image:
      'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: '03',
    title: 'Statue',
    category: 'Form',
    year: 'Select',
    note: 'Weight and stillness.',
    span: 'square',
    imageAlt: 'Photograph of a statue emphasizing form, weight and stillness',
    image:
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '04',
    title: 'Quiet Gaze',
    category: 'Portrait',
    year: 'Select',
    note: 'A scene in a look.',
    span: 'tall',
    imageAlt: 'Quiet Gaze portrait study — subject looking toward camera',
    image:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '05',
    title: 'Threshold',
    category: 'Atmosphere',
    year: 'Select',
    note: 'Light before the cut.',
    span: 'wide',
    imageAlt: 'Atmospheric landscape photograph Threshold — light over a ridge',
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: '06',
    title: 'Hands',
    category: 'Detail',
    year: 'Select',
    note: 'Story in the edges.',
    span: 'square',
    imageAlt: 'Detail photograph of hands — intimate character study',
    image:
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80',
  },
]

export const ABOUT_HEADSHOT = bradyHeadshot
export const ABOUT_HEADSHOT_ALT =
  'Outdoor portrait of Eugene Brady against a blue sky, looking toward the light'

export const PHOTO_LEDE =
  'Portrait studies approached as characters—still frames that carry the weight of a scene.'

export const CONTACT_ENQUIRIES = [
  { id: 'Directing', prompt: 'For directing and narrative enquiries.' },
  { id: 'Photography', prompt: 'For portrait and photographic commissions.' },
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
