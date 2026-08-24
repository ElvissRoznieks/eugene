import { useMemo } from 'react'
import Layout from '../components/Layout'
import PhotoStudies from '../components/PhotoStudies'
import SeoHead from '../components/SeoHead'
import {
  PhotoSeoCatalog,
  photoCollectionJsonLd,
} from '../components/SeoCatalog'
import { GALLERY, PAGE_SEO } from '../data/site'

export default function Photography() {
  const jsonLd = useMemo(() => photoCollectionJsonLd(), [])

  return (
    <Layout variant="dark">
      <SeoHead {...PAGE_SEO.photography} jsonLd={jsonLd} />
      <PhotoSeoCatalog />

      <div className="page-shell pb-16 pt-[5.5rem] mobile:pt-[4.5rem]">
        <PhotoStudies items={GALLERY} />
      </div>
    </Layout>
  )
}
