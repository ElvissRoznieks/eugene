import { useEffect } from 'react'
import {
  CONTACT_EMAIL,
  IMDB_PRO_URL,
  IMDB_URL,
  SITE_DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_NATIONALITY,
  SITE_OG_IMAGE,
  SITE_TAGLINE,
  SITE_URL,
  sitePath,
} from '../data/site'

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

function upsertLink(rel, href) {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
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
  el.textContent = JSON.stringify(data)
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
  type = 'website',
  jsonLd,
}) {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} · ${SITE_NAME}`
  const url = sitePath(path)

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'author', SITE_NAME)
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large')
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', image)
    upsertLink('canonical', url)
    upsertJsonLd('seo-json-ld', jsonLd)

    return () => {
      upsertJsonLd('seo-json-ld', null)
    }
  }, [fullTitle, description, url, image, type, jsonLd])

  return null
}

export function personJsonLd(extra = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    url: SITE_URL,
    jobTitle: SITE_TAGLINE,
    description: SITE_DEFAULT_DESCRIPTION,
    email: CONTACT_EMAIL,
    nationality: SITE_NATIONALITY,
    sameAs: [IMDB_URL, IMDB_PRO_URL],
    ...extra,
  }
}
