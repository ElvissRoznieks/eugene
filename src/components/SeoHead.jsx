import { useEffect } from 'react'
import {
  CONTACT_EMAIL,
  IMDB_PRO_URL,
  IMDB_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  SITE_CITY,
  SITE_DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_NATIONALITY,
  SITE_OG_IMAGE,
  SITE_TAGLINE,
  SITE_URL,
  sitePath,
} from '../data/site'
import { absoluteUrl } from '../utils/dom'

function upsertMeta(attr, key, content) {
  if (content == null || content === '') return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href, attrs = {}) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
  Object.entries(attrs).forEach(([k, v]) => {
    if (v != null) el.setAttribute(k, v)
  })
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(
    Array.isArray(data) ? { '@context': 'https://schema.org', '@graph': data.map(stripContext) } : data
  )
}

function stripContext(node) {
  if (!node || typeof node !== 'object') return node
  const { '@context': _c, ...rest } = node
  return rest
}

/**
 * Per-route document head for SPA SEO (title, description, OG, canonical, JSON-LD).
 * Pass a PAGE_SEO entry: <SeoHead {...PAGE_SEO.film} jsonLd={...} />
 */
export default function SeoHead({
  title,
  description = SITE_DEFAULT_DESCRIPTION,
  path = '/',
  image = SITE_OG_IMAGE,
  imageAlt = `${SITE_NAME} — ${SITE_TAGLINE}`,
  type = 'website',
  jsonLd,
}) {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} · ${SITE_NAME}`
  const url = sitePath(path)
  const ogImage = absoluteUrl(image, SITE_URL)

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'author', SITE_NAME)
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large')
    upsertMeta('name', 'theme-color', '#12100e')
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:locale', 'en_IE')
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:secure_url', ogImage)
    upsertMeta('property', 'og:image:alt', imageAlt)
    upsertMeta('property', 'og:image:type', 'image/png')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', ogImage)
    upsertMeta('name', 'twitter:image:alt', imageAlt)
    upsertLink('canonical', url)
    upsertJsonLd('seo-json-ld', jsonLd)

    return () => {
      upsertJsonLd('seo-json-ld', null)
    }
  }, [fullTitle, description, url, ogImage, imageAlt, type, jsonLd])

  return null
}

export function personJsonLd(extra = {}) {
  const image = absoluteUrl(extra.image || SITE_OG_IMAGE, SITE_URL)
  const { image: _ignored, ...rest } = extra
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    url: SITE_URL,
    image,
    jobTitle: SITE_TAGLINE,
    description: SITE_DEFAULT_DESCRIPTION,
    email: CONTACT_EMAIL,
    nationality: SITE_NATIONALITY,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_CITY,
      addressCountry: 'IE',
    },
    sameAs: [IMDB_URL, IMDB_PRO_URL, LINKEDIN_URL, INSTAGRAM_URL].filter(
      Boolean
    ),
    ...rest,
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: `${SITE_NAME} — ${SITE_TAGLINE}`,
    url: SITE_URL,
    description: SITE_DEFAULT_DESCRIPTION,
    publisher: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: 'en-IE',
  }
}

export function contactPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${SITE_NAME}`,
    url: sitePath('/contact'),
    description: `Contact ${SITE_NAME} for directing, photography or development enquiries.`,
    mainEntity: {
      '@type': 'Person',
      name: SITE_NAME,
      email: CONTACT_EMAIL,
      url: SITE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'professional enquiries',
        availableLanguage: ['English'],
      },
    },
  }
}

export function aboutPageJsonLd(image) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${SITE_NAME}`,
    url: sitePath('/about'),
    description: `About ${SITE_NAME} — ${SITE_NATIONALITY} director and photographer.`,
    mainEntity: personJsonLd({
      image,
      url: sitePath('/about'),
    }),
  }
}
