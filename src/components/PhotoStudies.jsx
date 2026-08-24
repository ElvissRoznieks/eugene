import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, /* Download, */ X } from 'lucide-react'
import {
  useBodyScrollLock,
  useHorizontalSwipe,
} from '../hooks/usePointerSwipe'
import useWaterRipple from '../hooks/useWaterRipple'
import { cx } from '../utils/dom'

const CLOSE_MS = 520
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function PhotoStudyPiece({
  item,
  index,
  revealed,
  isOrigin,
  onOpen,
  setPieceRef,
}) {
  const wrapRef = useRef(null)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  useWaterRipple({
    enabled: hovered && !isOrigin,
    canvasRef,
    imgRef,
    wrapRef,
  })

  const alt =
    item.imageAlt || `${item.title} — ${item.category} photograph`

  return (
    <button
      ref={(el) => {
        wrapRef.current = el
        setPieceRef(index, el)
      }}
      type="button"
      role="listitem"
      className={cx(
        'photo-studies__piece',
        'look',
        `photo-studies__piece--${item.span || 'square'}`,
        revealed && 'is-in',
        isOrigin && 'is-origin',
        hovered && 'is-water'
      )}
      data-study-index={index}
      onClick={() => onOpen(index)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-label={`Open ${item.title}`}
    >
      <img
        ref={imgRef}
        src={item.image}
        alt={alt}
        className="photo-studies__img"
        loading={index < 3 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
      />
      {hovered && !isOrigin ? (
        <canvas
          ref={canvasRef}
          className="photo-studies__water"
          aria-hidden="true"
        />
      ) : null}
    </button>
  )
}

/** Column count for LTR masonry (matches Page 4 light table reading order). */
function useGalleryColumns() {
  const [cols, setCols] = useState(3)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 809.98px)')
    const tablet = window.matchMedia('(max-width: 1199.98px)')
    const update = () => {
      if (mobile.matches) setCols(1)
      else if (tablet.matches) setCols(2)
      else setCols(3)
    }
    update()
    mobile.addEventListener('change', update)
    tablet.addEventListener('change', update)
    return () => {
      mobile.removeEventListener('change', update)
      tablet.removeEventListener('change', update)
    }
  }, [])

  return cols
}

export default function PhotoStudies({ items }) {
  const [active, setActive] = useState(null)
  const [closing, setClosing] = useState(false)
  const [revealed, setRevealed] = useState(() => new Set())
  const pieceRefs = useRef([])
  const overlayImgRef = useRef(null)
  const closeTimerRef = useRef(0)
  const colCount = useGalleryColumns()

  const columns = useMemo(() => {
    const cols = Array.from({ length: colCount }, () => [])
    items.forEach((item, i) => {
      cols[i % colCount].push({ item, i })
    })
    return cols
  }, [items, colCount])

  const open = active !== null && !closing
  const visible = active !== null
  const current = visible ? items[active] : null

  const revealedRef = useRef(new Set())
  const revealQueueRef = useRef([])
  const revealTimerRef = useRef(0)
  const revealBusyRef = useRef(false)

  const markRevealed = useCallback((index) => {
    revealedRef.current.add(index)
    setRevealed((prev) => {
      if (prev.has(index)) return prev
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  const enqueueReveal = useCallback(
    (index) => {
      if (!Number.isFinite(index)) return
      if (revealedRef.current.has(index)) return
      if (revealQueueRef.current.includes(index)) return
      revealQueueRef.current.push(index)

      const drain = () => {
        if (revealBusyRef.current) return
        const next = revealQueueRef.current.shift()
        if (next === undefined) return
        revealBusyRef.current = true
        markRevealed(next)
        revealTimerRef.current = window.setTimeout(() => {
          revealBusyRef.current = false
          drain()
        }, 155)
      }

      drain()
    },
    [markRevealed]
  )

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
      img.style.objectFit = ''
    }
  }, [])

  // Keep lightbox image letterboxed to the viewport (never cover/crop)
  useEffect(() => {
    if (!open) return
    const img = overlayImgRef.current
    if (!img) return
    img.style.width = ''
    img.style.height = ''
    img.style.maxWidth = ''
    img.style.maxHeight = ''
    img.style.objectFit = 'contain'
    img.style.position = ''
    img.style.left = ''
    img.style.top = ''
  }, [open, active])

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

  /* Download disabled
  const downloadCurrent = useCallback(async () => {
    if (active === null || closing) return
    const item = items[active]
    if (!item?.image) return

    const base = (item.title || `study-${item.id || active + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const extMatch = String(item.image).match(/\.(webp|jpe?g|png|gif)(?:\?|$)/i)
    const ext = (extMatch?.[1] || 'webp').toLowerCase()
    const filename = `${base}.${ext}`

    try {
      const res = await fetch(item.image)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      window.open(item.image, '_blank', 'noopener,noreferrer')
    }
  }, [active, closing, items])
  */

  const swipe = useHorizontalSwipe(step)
  useBodyScrollLock(open)

  useEffect(() => {
    document.documentElement.classList.toggle('is-gallery-focus', visible)
    return () => document.documentElement.classList.remove('is-gallery-focus')
  }, [visible])

  useEffect(() => {
    return () => {
      window.clearTimeout(closeTimerRef.current)
      window.clearTimeout(revealTimerRef.current)
    }
  }, [])

  // First-look: fade pieces one-by-one as they enter the viewport
  useEffect(() => {
    const nodes = pieceRefs.current
      .map((el, i) => (el ? { el, i } : null))
      .filter(Boolean)
    if (!nodes.length) return undefined

    if (prefersReducedMotion()) {
      setRevealed(new Set(nodes.map(({ i }) => i)))
      return undefined
    }

    revealQueueRef.current = []
    revealBusyRef.current = false
    revealedRef.current = new Set()
    window.clearTimeout(revealTimerRef.current)

    const observer = new IntersectionObserver(
      (entries) => {
        const incoming = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => Number(entry.target.getAttribute('data-study-index')))
          .filter((index) => Number.isFinite(index))
          .sort((a, b) => a - b)

        incoming.forEach((index) => {
          const el = pieceRefs.current[index]
          if (el) observer.unobserve(el)
          enqueueReveal(index)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -14% 0px' }
    )

    nodes
      .slice()
      .sort((a, b) => a.i - b.i)
      .forEach(({ el, i }) => {
        el.setAttribute('data-study-index', String(i))
        observer.observe(el)
      })

    return () => {
      observer.disconnect()
      window.clearTimeout(revealTimerRef.current)
      revealBusyRef.current = false
      revealQueueRef.current = []
    }
  }, [items, enqueueReveal, colCount])

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
        onClick={(e) => {
          if (closing) return
          if (e.target.closest('.photo-studies__overlay-img')) return
          if (e.target.closest('.photo-studies__tools')) return
          if (e.target.closest('.photo-studies__nav-btn')) return
          close()
        }}
        {...(closing ? {} : swipe)}
      >
        <div className="photo-studies__backdrop" aria-hidden="true" />

        <div className="photo-studies__tools">
          {/* Download disabled
          <button
            type="button"
            className="photo-studies__tool"
            onClick={downloadCurrent}
            aria-label="Download image"
            title="Download"
            disabled={closing}
          >
            <Download size={16} strokeWidth={1.75} />
          </button>
          */}
          <button
            type="button"
            className="photo-studies__close"
            onClick={close}
            aria-label="Close study"
            disabled={closing}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

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
            loading="eager"
            decoding="async"
            draggable={false}
            onClick={(e) => e.stopPropagation()}
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

        <button
          type="button"
          className="photo-studies__nav-btn photo-studies__nav-btn--prev"
          onClick={() => step(-1)}
          disabled={closing || active <= 0}
          aria-label="Previous study"
        >
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className="photo-studies__nav-btn photo-studies__nav-btn--next"
          onClick={() => step(1)}
          disabled={closing || active >= items.length - 1}
          aria-label="Next study"
        >
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>
        <span className="photo-studies__count">
          {active + 1} / {items.length}
        </span>
      </div>,
      document.body
    )

  return (
    <div className="photo-studies">
      <div className="photo-studies__wall" role="list">
        {columns.map((col, ci) => (
          <div key={ci} className="photo-studies__column">
            {col.map(({ item, i }) => (
              <PhotoStudyPiece
                key={item.id}
                item={item}
                index={i}
                revealed={revealed.has(i)}
                isOrigin={active === i}
                onOpen={goTo}
                setPieceRef={(index, el) => {
                  pieceRefs.current[index] = el
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {overlay}
    </div>
  )
}
