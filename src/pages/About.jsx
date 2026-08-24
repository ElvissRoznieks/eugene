import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Reveal from '../components/Reveal'
import SeoHead, { personJsonLd } from '../components/SeoHead'
import useWaterRipple from '../hooks/useWaterRipple'
import {
  ABOUT_CHAPTERS,
  ABOUT_HEADSHOT,
  ABOUT_HEADSHOT_ALT,
  FILMS,
  PAGE_SEO,
  SITE_LOCATION_LINE,
  SITE_NAME,
  SITE_TAGLINE,
  sitePath,
} from '../data/site'

export default function About() {
  const [filmIndex, setFilmIndex] = useState(0)
  const [portraitHover, setPortraitHover] = useState(false)
  const sectionRefs = useRef([])
  const portraitWrapRef = useRef(null)
  const portraitImgRef = useRef(null)
  const portraitCanvasRef = useRef(null)
  const jsonLd = useMemo(
    () =>
      personJsonLd({
        image: ABOUT_HEADSHOT,
        url: sitePath('/about'),
      }),
    []
  )

  useWaterRipple({
    enabled: portraitHover,
    canvasRef: portraitCanvasRef,
    imgRef: portraitImgRef,
    wrapRef: portraitWrapRef,
    intensity: 0.5,
    objectPosition: 'center 18%',
  })

  const activeFilm = FILMS[filmIndex] || FILMS[0]

  // One film per scroll section — all three titles are reachable
  useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean)
    if (!nodes.length || !FILMS.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (!top) return
        const raw = top.target.getAttribute('data-film-index')
        const idx = Number(raw)
        if (Number.isFinite(idx)) {
          setFilmIndex(Math.min(FILMS.length - 1, Math.max(0, idx)))
        }
      },
      { root: null, rootMargin: '-30% 0px -40% 0px', threshold: [0.15, 0.4, 0.65] }
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  return (
    <Layout variant="paper">
      <SeoHead {...PAGE_SEO.about} jsonLd={jsonLd} />
      <div className="about-essay">
        <aside className="about-essay__rail">
          <Reveal
            className="about-essay__portrait"
            variant="up"
            immediate
            delay={40}
          >
            <div
              ref={portraitWrapRef}
              className="about-essay__frame"
              onPointerEnter={() => setPortraitHover(true)}
              onPointerLeave={() => setPortraitHover(false)}
            >
              <img
                ref={portraitImgRef}
                src={ABOUT_HEADSHOT}
                alt={ABOUT_HEADSHOT_ALT}
                className="about-essay__img"
                width={1200}
                height={1500}
                decoding="async"
              />
              {portraitHover ? (
                <canvas
                  ref={portraitCanvasRef}
                  className="about-essay__water"
                  aria-hidden="true"
                />
              ) : null}
              <div className="about-essay__scrim" aria-hidden="true" />
              <div className="about-essay__place">
                <p>{SITE_LOCATION_LINE}</p>
              </div>
              <div className="about-essay__credit" aria-live="polite">
                <p className="about-essay__directed">Directed</p>
                <p key={activeFilm.title} className="about-essay__role">
                  {activeFilm.title}
                </p>
              </div>
            </div>
          </Reveal>
        </aside>

        <div className="about-essay__copy page-shell">
          <header className="about-essay__head">
            {/* Kicker commented out
            <Reveal as="p" className="about-essay__kicker" immediate delay={0}>
              {pageKicker('/about')}
            </Reveal>
            */}
            <Reveal
              as="h1"
              className="about-essay__title look--title"
              variant="up"
              immediate
              delay={90}
            >
              {SITE_NAME}
              <span className="text-[var(--accent)]">.</span>
            </Reveal>
            <Reveal
              as="p"
              className="about-essay__subtitle"
              immediate
              delay={200}
            >
              {SITE_TAGLINE} · BAFTA Member
            </Reveal>
          </header>

          {ABOUT_CHAPTERS.map((chapter, i) => {
            const filmIdx = Math.min(i, FILMS.length - 1)
            return (
              <Reveal
                key={chapter.id}
                as="section"
                delay={i * 40}
                ref={(el) => {
                  sectionRefs.current[i] = el
                }}
                data-film-index={filmIdx}
                className={`about-chapter${i === 0 ? ' about-chapter--lead' : ''}`}
              >
                <p className="about-chapter__label">{chapter.label}</p>
                {chapter.paragraphs.map((text) => (
                  <p key={text.slice(0, 24)} className="about-chapter__body">
                    {text}
                  </p>
                ))}
              </Reveal>
            )
          })}

          {/* Selected films list commented out
          <Reveal
            as="section"
            ref={(el) => {
              sectionRefs.current[ABOUT_CHAPTERS.length] = el
            }}
            data-film-index={FILMS.length - 1}
            className="about-chapter about-chapter--films"
          >
            <p className="about-chapter__label">05 / Selected films</p>
            <ul className="about-essay__films">
              {FILMS.map((film, i) => (
                <li key={film.title}>
                  <Link
                    to="/film"
                    className={`about-essay__film-link${filmIndex === i ? ' is-active' : ''}`}
                  >
                    <span
                      className={
                        film.inDevelopment
                          ? 'text-[var(--accent)]'
                          : undefined
                      }
                    >
                      {film.title}
                    </span>
                    <span className="about-essay__film-year">{film.year}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
          */}

          <Reveal className="about-essay__actions" delay={80}>
            <Link
              to="/film"
              className="project-btn-dark inline-flex px-5 py-3 text-xs font-medium uppercase tracking-[-0.12px]"
            >
              <span>view films</span>
            </Link>
            <Link
              to="/contact"
              className="about-essay__ghost inline-flex px-5 py-3 text-xs font-medium uppercase tracking-[-0.12px]"
            >
              get in touch
            </Link>
          </Reveal>
        </div>
      </div>
    </Layout>
  )
}
