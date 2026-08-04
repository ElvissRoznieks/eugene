import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  useBodyScrollLock,
  useHorizontalSwipe,
} from '../hooks/usePointerSwipe'
import { cx } from '../utils/dom'

export default function LightTable({ items }) {
  const [active, setActive] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)
  const stripRef = useRef(null)
  const current = items[active]

  const goTo = useCallback(
    (i) => {
      setActive(Math.min(items.length - 1, Math.max(0, i)))
    },
    [items.length]
  )

  const step = useCallback(
    (dir) => {
      setActive((i) => Math.min(items.length - 1, Math.max(0, i + dir)))
    },
    [items.length]
  )

  const swipe = useHorizontalSwipe(step)
  useBodyScrollLock(viewerOpen)

  useEffect(() => {
    const thumb = stripRef.current?.querySelector('.is-active')
    thumb?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [active])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && viewerOpen) {
        setViewerOpen(false)
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'Enter' && !viewerOpen) {
        setViewerOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, viewerOpen])

  if (!current) return null

  const alt =
    current.imageAlt || `${current.title} — ${current.category} photograph`

  return (
    <div className="light-table">
      <div className="light-table__stage" {...swipe}>
        <button
          type="button"
          className="light-table__stage-hit"
          onClick={() => setViewerOpen(true)}
          aria-label={`Open ${current.title} full view`}
        >
          <img
            key={current.id}
            src={current.image}
            alt={alt}
            className="light-table__stage-img"
            draggable={false}
          />
        </button>

        <div className="light-table__stage-meta">
          <p className="light-table__meta-id">
            {current.id} / {current.category}
          </p>
          <h2 className="light-table__meta-title">{current.title}</h2>
          {current.note ? (
            <p className="light-table__meta-note">{current.note}</p>
          ) : null}
        </div>

        <div className="light-table__stage-nav" aria-hidden="true">
          <button
            type="button"
            className="light-table__nav-btn"
            onClick={() => step(-1)}
            disabled={active <= 0}
            aria-label="Previous frame"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="light-table__nav-btn"
            onClick={() => step(1)}
            disabled={active >= items.length - 1}
            aria-label="Next frame"
          >
            <ChevronRight size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div
        ref={stripRef}
        className="light-table__strip"
        role="listbox"
        aria-label="Contact sheet"
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={i === active}
            className={cx('light-table__thumb', i === active && 'is-active')}
            onClick={() => goTo(i)}
          >
            <img
              src={item.image}
              alt={
                item.imageAlt ||
                `${item.title} — ${item.category} contact sheet frame`
              }
              draggable={false}
              loading="lazy"
            />
            <span className="light-table__thumb-id">{item.id}</span>
          </button>
        ))}
      </div>

      {viewerOpen ? (
        <div
          className="light-table__viewer"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
        >
          <button
            type="button"
            className="light-table__viewer-close"
            onClick={() => setViewerOpen(false)}
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.75} />
          </button>

          <div className="light-table__viewer-frame" aria-hidden="true">
            <span className="light-table__vf light-table__vf--tl" />
            <span className="light-table__vf light-table__vf--tr" />
            <span className="light-table__vf light-table__vf--bl" />
            <span className="light-table__vf light-table__vf--br" />
          </div>

          <img
            src={current.image}
            alt={alt}
            className="light-table__viewer-img"
            draggable={false}
          />

          <div className="light-table__viewer-bar">
            <p>
              {current.id} · {current.category}
              {current.year ? ` · ${current.year}` : ''}
            </p>
            <p>{current.title}</p>
            <div className="light-table__viewer-arrows">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={active <= 0}
                aria-label="Previous"
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </button>
              <span>
                {active + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={active >= items.length - 1}
                aria-label="Next"
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
