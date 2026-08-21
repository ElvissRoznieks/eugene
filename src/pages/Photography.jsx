import { useMemo, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import PhotoStudies from '../components/PhotoStudies'
import Reveal from '../components/Reveal'
import SeoHead from '../components/SeoHead'
import {
  PhotoSeoCatalog,
  photoCollectionJsonLd,
} from '../components/SeoCatalog'
import { GALLERY, PAGE_SEO, PHOTO_LEDE, pageKicker } from '../data/site'

export default function Photography() {
  const jsonLd = useMemo(() => photoCollectionJsonLd(), [])
  const heroRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        const fade = Math.max(0, 1 - y / 280)
        const shift = Math.min(y * 0.35, 72)
        hero.style.setProperty('--hero-fade', String(fade))
        hero.style.setProperty('--hero-shift', `${shift}px`)
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <Layout variant="dark">
      <SeoHead {...PAGE_SEO.photography} jsonLd={jsonLd} />
      <PhotoSeoCatalog />

      <header ref={heroRef} className="photo-hero page-shell">
        <div className="photo-hero__sticky">
          <Reveal as="p" className="photo-hero__kicker" immediate delay={0}>
            {pageKicker('/photography')}
          </Reveal>
          <Reveal
            as="h1"
            className="photo-hero__title"
            immediate
            delay={80}
          >
            Portraiture
            <span className="text-[var(--accent)]">.</span>
          </Reveal>
          <Reveal
            as="p"
            className="photo-hero__lede"
            immediate
            delay={160}
          >
            {PHOTO_LEDE}
          </Reveal>
        </div>
      </header>

      <div className="page-shell pb-16">
        <PhotoStudies items={GALLERY} />
      </div>
    </Layout>
  )
}
