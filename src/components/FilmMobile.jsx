import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, LogIn, Star, X } from 'lucide-react'
import { FILMS } from '../data/site'
import { useBodyScrollLock, useHorizontalSwipe } from '../hooks/usePointerSwipe'
import { cx } from '../utils/dom'

function filmSlides(film) {
  const poster = {
    id: `${film.index}-poster`,
    src: film.poster,
    title: film.title,
    alt: film.imageAlt || film.title,
  }
  const rest = film.gallery || []
  if (!rest.length) return [poster]
  return film.galleryPoster === 'last' ? [...rest, poster] : [poster, ...rest]
}

function FameRating({ film }) {
  if (film.inDevelopment) {
    return (
      <div className="film-mobile__rating">
        <p className="film-mobile__score film-mobile__score--pending">
          In Development
        </p>
      </div>
    )
  }

  if (film.rating == null) return null

  return (
    <div className="film-mobile__rating">
      <div className="film-mobile__stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i < Math.round((film.rating / 10) * 5)
          return (
            <Star
              key={i}
              size={14}
              strokeWidth={1.6}
              className={filled ? 'film-mobile__star is-on' : 'film-mobile__star'}
              fill={filled ? 'currentColor' : 'none'}
            />
          )
        })}
      </div>
      <p className="film-mobile__score">
        <span>{film.rating.toFixed(1)}</span>
        <span className="film-mobile__score-den"> / {film.ratingOutOf}</span>
      </p>
    </div>
  )
}

function GalleryLightbox({ slides, open, onClose }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (open) setIndex(0)
  }, [open, slides])

  useBodyScrollLock(open)

  useEffect(() => {
    document.documentElement.classList.toggle('is-gallery-focus', open)
    return () => document.documentElement.classList.remove('is-gallery-focus')
  }, [open])

  const step = (dir) => {
    setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + dir)))
  }

  const swipe = useHorizontalSwipe((dir) => step(dir))

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(0, i - 1))
      }
      if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(slides.length - 1, i + 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, slides.length])

  if (!open || !slides.length || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="film-mobile__gallery is-open"
      role="dialog"
      aria-modal="true"
      aria-label="Frame gallery"
      {...swipe}
    >
      <button
        type="button"
        className="film-mobile__gallery-close"
        onClick={onClose}
        aria-label="Close gallery"
      >
        <X size={22} strokeWidth={1.5} />
      </button>

      <div
        className="film-mobile__gallery-track"
        style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
      >
        {slides.map((slide, i) => {
          const inView = Math.abs(i - index) <= 1
          return (
            <figure key={slide.id} className="film-mobile__gallery-slide">
              {inView ? (
                <div className="film-mobile__frame">
                  <img
                    src={slide.src}
                    alt={slide.alt || slide.title}
                    draggable={false}
                    decoding="async"
                    loading={i === index ? 'eager' : 'lazy'}
                  />
                </div>
              ) : null}
            </figure>
          )
        })}
      </div>

      <button
        type="button"
        className="film-mobile__gallery-arrow film-mobile__gallery-arrow--prev"
        onClick={() => step(-1)}
        disabled={index <= 0}
        aria-label="Previous still"
      >
        <ChevronLeft size={24} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className="film-mobile__gallery-arrow film-mobile__gallery-arrow--next"
        onClick={() => step(1)}
        disabled={index >= slides.length - 1}
        aria-label="Next still"
      >
        <ChevronRight size={24} strokeWidth={1.75} />
      </button>

      <p className="film-mobile__gallery-meta">
        {index + 1} / {slides.length}
      </p>
    </div>,
    document.body
  )
}

export default function FilmMobile() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const active = FILMS[activeIndex] || FILMS[0]

  const slides = useMemo(() => filmSlides(active), [active])
  const hasGallery = (active.gallery?.length || 0) > 0

  const step = (dir) => {
    setActiveIndex((i) => Math.min(FILMS.length - 1, Math.max(0, i + dir)))
  }

  const swipe = useHorizontalSwipe((dir) => step(dir))

  return (
    <section className="film-mobile" aria-label="Films">
      <div className="film-mobile__carousel page-shell">
        <div className="film-mobile__stage" {...swipe}>
          <div className="film-mobile__poster" key={active.title}>
            <div className="film-mobile__frame">
              <img
                src={active.poster}
                alt={active.imageAlt || active.title}
                draggable={false}
                decoding="async"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>

        <div className="film-mobile__controls">
          <button
            type="button"
            className="film-mobile__arrow film-mobile__arrow--prev"
            onClick={() => step(-1)}
            disabled={activeIndex <= 0}
            aria-label="Previous film"
          >
            <ChevronLeft size={16} strokeWidth={1.75} />
          </button>

          <div
            className="film-mobile__dots"
            role="tablist"
            aria-label="Choose film"
          >
            {FILMS.map((film, i) => (
              <button
                key={film.title}
                type="button"
                role="tab"
                className={cx('film-mobile__dot', i === activeIndex && 'is-on')}
                onClick={() => setActiveIndex(i)}
                aria-label={film.title}
                aria-selected={i === activeIndex}
                tabIndex={i === activeIndex ? 0 : -1}
              />
            ))}
          </div>

          <button
            type="button"
            className="film-mobile__arrow film-mobile__arrow--next"
            onClick={() => step(1)}
            disabled={activeIndex >= FILMS.length - 1}
            aria-label="Next film"
          >
            <ChevronRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="film-mobile__copy page-shell" key={active.title}>
        <FameRating film={active} />

        <h2 className="film-mobile__title">
          {(active.titleLines || [active.title]).map((line, i, lines) => (
            <span key={line}>
              {line}
              {i < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h2>

        <p className="film-mobile__label">Synopsis</p>
        <p className="film-mobile__synopsis">{active.synopsis}</p>

        <div className="film-mobile__actions">
          {hasGallery ? (
            <button
              type="button"
              className="film-mobile__gallery-btn"
              onClick={() => setGalleryOpen(true)}
            >
              <LogIn size={15} strokeWidth={1.75} aria-hidden="true" />
              View gallery
            </button>
          ) : null}
        </div>
      </div>

      <GalleryLightbox
        slides={slides}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </section>
  )
}
