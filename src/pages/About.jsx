import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SeoHead, { personJsonLd } from '../components/SeoHead'
import useDublinClock from '../hooks/useDublinClock'
import {
  ABOUT_CHAPTERS,
  ABOUT_HEADSHOT,
  ABOUT_HEADSHOT_ALT,
  FILMS,
  PAGE_SEO,
  SITE_CITY,
  SITE_LOCATION_LINE,
  SITE_NAME,
  SITE_TAGLINE,
  pageKicker,
  sitePath,
} from '../data/site'

export default function About() {
  const time = useDublinClock()
  const [role, setRole] = useState(ABOUT_CHAPTERS[0].role)
  const chapterRefs = useRef([])
  const jsonLd = useMemo(
    () =>
      personJsonLd({
        image: ABOUT_HEADSHOT,
        url: sitePath('/about'),
      }),
    []
  )

  useEffect(() => {
    const nodes = chapterRefs.current.filter(Boolean)
    if (!nodes.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (!top) return
        const id = top.target.getAttribute('data-chapter')
        const chapter = ABOUT_CHAPTERS.find((c) => c.id === id)
        if (chapter) setRole(chapter.role)
      },
      { root: null, rootMargin: '-28% 0px -42% 0px', threshold: [0.2, 0.45, 0.7] }
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [])

  return (
    <Layout variant="paper">
      <SeoHead {...PAGE_SEO.about} jsonLd={jsonLd} />
      <div className="about-treatment page-shell">
        <aside className="about-treatment__portrait">
          <div className="about-treatment__frame">
            <img
              src={ABOUT_HEADSHOT}
              alt={ABOUT_HEADSHOT_ALT}
              className="about-treatment__img"
              width={1200}
              height={1500}
              decoding="async"
            />
            <div className="about-treatment__scrim" aria-hidden="true" />
            <p key={role} className="about-treatment__role">
              {role}
            </p>
          </div>
          <div className="about-treatment__place">
            <p>{SITE_LOCATION_LINE}</p>
            <p aria-live="polite">
              {SITE_CITY} {time}
            </p>
          </div>
        </aside>

        <div className="about-treatment__copy">
          <header className="about-treatment__head">
            <p className="about-treatment__kicker">{pageKicker('/about')}</p>
            <h1 className="about-treatment__title">
              {SITE_NAME}
              <span className="text-[var(--accent)]">.</span>
            </h1>
            <p className="about-treatment__subtitle">
              {SITE_TAGLINE} · BAFTA Member
            </p>
          </header>

          {ABOUT_CHAPTERS.map((chapter, i) => (
            <section
              key={chapter.id}
              ref={(el) => {
                chapterRefs.current[i] = el
              }}
              data-chapter={chapter.id}
              className="about-chapter"
            >
              <p className="about-chapter__label">{chapter.label}</p>
              {chapter.paragraphs.map((text) => (
                <p key={text.slice(0, 24)} className="about-chapter__body">
                  {text}
                </p>
              ))}
            </section>
          ))}

          <section className="about-chapter about-chapter--films">
            <p className="about-chapter__label">04 / Selected films</p>
            <ul className="about-treatment__films">
              {FILMS.map((film) => (
                <li key={film.title}>
                  <Link to="/film" className="about-treatment__film-link">
                    <span
                      className={
                        film.inDevelopment
                          ? 'text-[var(--accent)]'
                          : undefined
                      }
                    >
                      {film.title}
                    </span>
                    <span className="about-treatment__film-year">
                      {film.year}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="about-treatment__actions">
            <Link
              to="/film"
              className="project-btn-dark inline-flex px-5 py-3 text-xs font-medium uppercase tracking-[-0.12px]"
            >
              <span>view films</span>
            </Link>
            <Link
              to="/contact"
              className="about-treatment__ghost inline-flex px-5 py-3 text-xs font-medium uppercase tracking-[-0.12px]"
            >
              get in touch
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
