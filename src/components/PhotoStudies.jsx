import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  useBodyScrollLock,
  useHorizontalSwipe,
} from '../hooks/usePointerSwipe'
import { cx } from '../utils/dom'

export default function PhotoStudies({ items }) {
  const [active, setActive] = useState(null)
  const open = active !== null
  const current = open ? items[active] : null

  const goTo = useCallback(
    (i) => {
      setActive(Math.min(items.length - 1, Math.max(0, i)))
    },
    [items.length]
  )

  const step = useCallback(
    (dir) => {
      setActive((i) => {
        if (i === null) return i
        return Math.min(items.length - 1, Math.max(0, i + dir))
      })
    },
    [items.length]
  )

  const close = useCallback(() => setActive(null), [])

  const swipe = useHorizontalSwipe(step)
  useBodyScrollLock(open)

  useEffect(() => {
    document.documentElement.classList.toggle('is-gallery-focus', open)
    return () => document.documentElement.classList.remove('is-gallery-focus')
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        step(1)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step, close])

  if (!items?.length) return null

  const overlay =
    current &&
    createPortal(
      <div
        className="photo-studies__overlay"
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        {...swipe}
      >
        <div
          className="photo-studies__backdrop"
          aria-hidden="true"
          onClick={close}
        />

        <button
          type="button"
          className="photo-studies__close"
          onClick={close}
          aria-label="Close study"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className="photo-studies__stage">
          <img
            key={current.id}
            src={current.image}
            alt={
              current.imageAlt ||
              `${current.title} — ${current.category} photograph`
            }
            className="photo-studies__overlay-img"
            draggable={false}
          />
        </div>

        <div className="photo-studies__caption">
          <p className="photo-studies__caption-id">
            {current.id} · {current.category}
            {current.year ? ` · ${current.year}` : ''}
          </p>
          <h2 className="photo-studies__caption-title">{current.title}</h2>
          {current.note ? (
            <p className="photo-studies__caption-note">{current.note}</p>
          ) : null}
        </div>

        <div className="photo-studies__nav">
          <button
            type="button"
            className="photo-studies__nav-btn"
            onClick={() => step(-1)}
            disabled={active <= 0}
            aria-label="Previous study"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <span className="photo-studies__count">
            {active + 1} / {items.length}
          </span>
          <button
            type="button"
            className="photo-studies__nav-btn"
            onClick={() => step(1)}
            disabled={active >= items.length - 1}
            aria-label="Next study"
          >
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>,
      document.body
    )

  return (
    <div className="photo-studies">
      <div className="photo-studies__wall" role="list">
        {items.map((item, i) => {
          const alt =
            item.imageAlt || `${item.title} — ${item.category} photograph`
          return (
            <button
              key={item.id}
              type="button"
              role="listitem"
              className={cx(
                'photo-studies__piece',
                `photo-studies__piece--${item.span || 'square'}`
              )}
              onClick={() => goTo(i)}
              aria-label={`Open ${item.title}`}
            >
              <img
                src={item.image}
                alt={alt}
                className="photo-studies__img"
                loading="lazy"
                draggable={false}
              />
              <span className="photo-studies__meta">
                <span className="photo-studies__id">{item.id}</span>
                <span className="photo-studies__title">{item.title}</span>
              </span>
            </button>
          )
        })}
      </div>

      {overlay}
    </div>
  )
}
