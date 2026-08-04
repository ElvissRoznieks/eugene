import { useMemo } from 'react'
import Layout from '../components/Layout'
import LightTable from '../components/LightTable'
import SeoHead from '../components/SeoHead'
import {
  PhotoSeoCatalog,
  photoCollectionJsonLd,
} from '../components/SeoCatalog'
import { GALLERY, PAGE_SEO, PHOTO_LEDE, pageKicker } from '../data/site'

export default function Photography() {
  const jsonLd = useMemo(() => photoCollectionJsonLd(), [])

  return (
    <Layout variant="dark">
      <SeoHead {...PAGE_SEO.photography} jsonLd={jsonLd} />
      <PhotoSeoCatalog />

      <header className="photo-hero page-shell">
        <p className="photo-hero__kicker">{pageKicker('/photography')}</p>
        <h1 className="photo-hero__title">
          Portraiture
          <span className="text-[var(--accent)]">.</span>
        </h1>
        <p className="photo-hero__lede">{PHOTO_LEDE}</p>
      </header>

      <div className="page-shell pb-10">
        <LightTable items={GALLERY} />
      </div>
    </Layout>
  )
}
