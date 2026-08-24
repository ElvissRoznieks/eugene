import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Reveal from '../components/Reveal'
import SeoHead, { personJsonLd } from '../components/SeoHead'
import useWaterRipple from '../hooks/useWaterRipple'
import {
  ABOUT_BIO,
  ABOUT_HEADSHOT,
  ABOUT_HEADSHOT_ALT,
  FILMS,
  PAGE_SEO,
  SITE_LOCATION_LINE,
  SITE_NAME,
  SITE_TAGLINE,
  sitePath,
} from '../data/site'

const FEATURED_FILM =
  FILMS.find((film) => film.inDevelopment) || FILMS[FILMS.length - 1]

export default function About() {
  const [portraitHover, setPortraitHover] = useState(false)
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
              <div className="about-essay__credit">
                <p className="about-essay__directed">In development</p>
                <p className="about-essay__role">{FEATURED_FILM.title}</p>
              </div>
            </div>
          </Reveal>
        </aside>

        <div className="about-essay__copy page-shell">
          <header className="about-essay__head">
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
              {SITE_TAGLINE}
            </Reveal>
          </header>

          <Reveal
            as="section"
            className="about-chapter about-chapter--lead"
            immediate
            delay={260}
          >
            <div className="about-chapter__bio">
              {ABOUT_BIO.map((text) => (
                <p key={text.slice(0, 32)} className="about-chapter__body">
                  {text}
                </p>
              ))}
            </div>
          </Reveal>

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
