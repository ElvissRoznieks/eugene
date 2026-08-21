import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  useBodyScrollLock,
  useHorizontalSwipe,
} from '../hooks/usePointerSwipe'
import { cx } from '../utils/dom'

const CLOSE_MS = 520
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function PhotoStudies({ items }) {
  const [active, setActive] = useState(null)
  const [closing, setClosing] = useState(false)
  const pieceRefs = useRef([])
  const overlayImgRef = useRef(null)
  const closeTimerRef = useRef(0)

  const open = active !== null && !closing
  const visible = active !== null
  const current = visible ? items[active] : null

  const goTo = useCallback(
    (i) => {
      if (closing) return
      setClosing(false)
      setActive(Math.min(items.length - 1, Math.max(0, i)))
    },
    [items.length, closing]
  )

  const step = useCallback(
    (dir) => {
      if (closing) return
      setActive((i) => {
        if (i === null) return i
        return Math.min(items.length - 1, Math.max(0, i + dir))
      })
    },
    [items.length, closing]
  )

  const finishClose = useCallback(() => {
    window.clearTimeout(closeTimerRef.current)
    setClosing(false)
    setActive(null)
    const img = overlayImgRef.current
    if (img) {
      img.style.cssText = ''
    }
  }, [])

  const close = useCallback(() => {
    if (active === null || closing) return

    const thumb = pieceRefs.current[active]
    const img = overlayImgRef.current
    const index = active

    if (!thumb || !img || prefersReducedMotion()) {
      setClosing(true)
      // Unlock, jump to origin, then dismiss
      requestAnimationFrame(() => {
        pieceRefs.current[index]?.scrollIntoView({
          block: 'center',
          inline: 'nearest',
        })
        finishClose()
      })
      return
    }

    const from = img.getBoundingClientRect()
    setClosing(true)
    // Unlock immediately so we can scroll the origin cell into view
    document.body.style.overflow = ''

    // Wait a frame for layout, then zoom into the thumbnail
    requestAnimationFrame(() => {
      const origin = pieceRefs.current[index]
      if (!origin || !overlayImgRef.current) {
        finishClose()
        return
      }

      origin.scrollIntoView({ block: 'center', inline: 'nearest' })
      const to = origin.getBoundingClientRect()
      const fly = overlayImgRef.current

      fly.style.position = 'fixed'
      fly.style.left = `${from.left}px`
      fly.style.top = `${from.top}px`
      fly.style.width = `${from.width}px`
      fly.style.height = `${from.height}px`
      fly.style.maxWidth = 'none'
      fly.style.maxHeight = 'none'
      fly.style.margin = '0'
      fly.style.objectFit = 'cover'
      fly.style.zIndex = '210'
      fly.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)'
      fly.style.transition = 'none'
      fly.style.transformOrigin = 'center center'
      fly.style.opacity = '1'

      void fly.offsetWidth

      requestAnimationFrame(() => {
        const latest = origin.getBoundingClientRect()
        fly.style.transition = [
          `left ${CLOSE_MS}ms ${EASE}`,
          `top ${CLOSE_MS}ms ${EASE}`,
          `width ${CLOSE_MS}ms ${EASE}`,
          `height ${CLOSE_MS}ms ${EASE}`,
          `opacity ${CLOSE_MS}ms ${EASE}`,
          `box-shadow ${CLOSE_MS}ms ${EASE}`,
        ].join(', ')
        fly.style.left = `${latest.left}px`
        fly.style.top = `${latest.top}px`
        fly.style.width = `${latest.width}px`
        fly.style.height = `${latest.height}px`
        fly.style.opacity = '0.85'
        fly.style.boxShadow = 'none'
      })

      closeTimerRef.current = window.setTimeout(finishClose, CLOSE_MS + 40)
    })
  }, [active, closing, finishClose])

  const swipe = useHorizontalSwipe(step)
  useBodyScrollLock(open)

  useEffect(() => {
    document.documentElement.classList.toggle('is-gallery-focus', visible)
    return () => document.documentElement.classList.remove('is-gallery-focus')
  }, [visible])

  useEffect(() => {
    return () => window.clearTimeout(closeTimerRef.current)
  }, [])

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
        className={cx(
          'photo-studies__overlay',
          closing && 'is-closing'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        {...(closing ? {} : swipe)}
      >
        <div
          className="photo-studies__backdrop"
          aria-hidden="true"
          onClick={closing ? undefined : close}
        />

        <button
          type="button"
          className="photo-studies__close"
          onClick={close}
          aria-label="Close study"
          disabled={closing}
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className="photo-studies__stage">
          <img
            ref={overlayImgRef}
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
            disabled={closing || active <= 0}
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
            disabled={closing || active >= items.length - 1}
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
          const isOrigin = active === i
          return (
            <button
              key={item.id}
              ref={(el) => {
                pieceRefs.current[i] = el
              }}
              type="button"
              role="listitem"
              className={cx(
                'photo-studies__piece',
                `photo-studies__piece--${item.span || 'square'}`,
                isOrigin && 'is-origin'
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
