/** Join class names; falsy entries are skipped. */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}

/** Resolve a relative asset path to an absolute URL for SEO / OG. */
export function absoluteUrl(src, origin = typeof window !== 'undefined' ? window.location?.origin : '') {
  if (!src) return origin || ''
  if (typeof src !== 'string') return origin || ''
  if (src.startsWith('http')) return src
  const base = origin || ''
  return `${base}${src.startsWith('/') ? '' : '/'}${src}`
}
