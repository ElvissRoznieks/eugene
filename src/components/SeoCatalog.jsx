import {
  FILMS,
  FILM_TITLES_INLINE,
  GALLERY,
  PHOTO_LEDE,
  SITE_NAME,
  SITE_URL,
  sitePath,
} from '../data/site'
import { absoluteUrl } from '../utils/dom'

/**
 * Crawlable HTML mirror of WebGL poster textures + on-wall copy.
 * Canvas pixels are invisible to search engines; this keeps posters,
 * titles, synopses and credits in the document for SEO + a11y.
 */
export function FilmSeoCatalog() {
  return (
    <section className="seo-sr" aria-label="Filmography">
      <h1>Films directed by {SITE_NAME}</h1>
      <p>
        Feature and development work by Irish director {SITE_NAME}, including{' '}
        {FILM_TITLES_INLINE}.
      </p>
      <ul>
        {FILMS.map((film) => (
          <li key={film.index}>
            <article>
              <h2>
                {film.title} ({film.year})
              </h2>
              <img
                src={film.poster}
                alt={film.imageAlt || `${film.title} film poster`}
                width={1024}
                height={717}
                loading="lazy"
                decoding="async"
              />
              <p>{film.synopsis}</p>
              <p>{film.credits}</p>
              {film.rating != null ? (
                <p>
                  Rating: {film.rating} / {film.ratingOutOf}
                </p>
              ) : (
                <p>Status: In development</p>
              )}
              {film.imdb ? (
                <p>
                  <a href={film.imdb} rel="noopener noreferrer">
                    {film.title} on IMDb
                  </a>
                </p>
              ) : null}
              {film.gallery?.length ? (
                <ul>
                  {film.gallery.map((still) => (
                    <li key={still.id}>
                      <img
                        src={still.src}
                        alt={still.alt || `${film.title} — production still ${still.id}`}
                        width={1280}
                        height={720}
                        loading="lazy"
                        decoding="async"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Crawlable HTML mirror of photography selects (including inactive strip frames). */
export function PhotoSeoCatalog() {
  return (
    <section className="seo-sr" aria-label="Photography portfolio">
      <h1>Photography by {SITE_NAME}</h1>
      <p>
        Portrait studies and photographic selects by {SITE_NAME}. {PHOTO_LEDE}
      </p>
      <ul>
        {GALLERY.map((item) => (
          <li key={item.id}>
            <figure>
              <img
                src={item.image}
                alt={
                  item.imageAlt ||
                  `${item.title} — ${item.category} photograph by ${SITE_NAME}`
                }
                width={1200}
                height={1600}
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                {item.id}. {item.title} ({item.category})
                {item.note ? ` — ${item.note}` : ''}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function filmCollectionJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Films by ${SITE_NAME}`,
    description: `Feature films and projects directed by ${SITE_NAME}, including ${FILM_TITLES_INLINE}.`,
    url: sitePath('/film'),
    numberOfItems: FILMS.length,
    itemListElement: FILMS.map((film, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Movie',
        name: film.title,
        description: film.synopsis,
        image: absoluteUrl(film.poster, SITE_URL),
        director: {
          '@type': 'Person',
          name: SITE_NAME,
          url: SITE_URL,
        },
        ...(film.inDevelopment ? {} : { dateCreated: String(film.year) }),
        ...(film.imdb ? { sameAs: film.imdb } : {}),
        ...(film.rating != null
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: film.rating,
                bestRating: film.ratingOutOf,
                worstRating: 1,
              },
            }
          : {}),
      },
    })),
  }
}

export function photoCollectionJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `Photography by ${SITE_NAME}`,
    description: `Portraiture and photographic studies by ${SITE_NAME}. ${PHOTO_LEDE}`,
    url: sitePath('/photography'),
    creator: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
    },
    image: GALLERY.map((item) => ({
      '@type': 'ImageObject',
      contentUrl: absoluteUrl(item.image, SITE_URL),
      name: item.title,
      description:
        item.imageAlt ||
        `${item.title} — ${item.category} photograph by ${SITE_NAME}`,
      creator: {
        '@type': 'Person',
        name: SITE_NAME,
      },
    })),
  }
}
