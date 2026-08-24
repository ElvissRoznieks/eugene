import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import SeoHead from '../components/SeoHead'
import {
  FilmSeoCatalog,
  filmCollectionJsonLd,
} from '../components/SeoCatalog'
import { PAGE_SEO } from '../data/site'

const PosterWall = lazy(() => import('../components/PosterWall'))
const FilmMobile = lazy(() => import('../components/FilmMobile'))

function useIsMobileFilm() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 809.98px)').matches
      : false
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 809.98px)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return mobile
}

export default function Film() {
  const mobile = useIsMobileFilm()
  const jsonLd = useMemo(() => filmCollectionJsonLd(), [])

  return (
    <Layout variant={mobile ? 'dark' : 'immersive'}>
      <SeoHead {...PAGE_SEO.film} jsonLd={jsonLd} />
      <FilmSeoCatalog />
      <Suspense fallback={null}>
        {mobile ? <FilmMobile /> : <PosterWall />}
      </Suspense>
    </Layout>
  )
}
