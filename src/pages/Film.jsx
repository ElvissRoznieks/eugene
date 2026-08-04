import { useMemo } from 'react'
import Layout from '../components/Layout'
import PosterWall from '../components/PosterWall'
import SeoHead from '../components/SeoHead'
import {
  FilmSeoCatalog,
  filmCollectionJsonLd,
} from '../components/SeoCatalog'
import { PAGE_SEO } from '../data/site'

export default function Film() {
  const jsonLd = useMemo(() => filmCollectionJsonLd(), [])

  return (
    <Layout variant="immersive">
      <SeoHead {...PAGE_SEO.film} jsonLd={jsonLd} />
      <FilmSeoCatalog />
      <PosterWall />
    </Layout>
  )
}
