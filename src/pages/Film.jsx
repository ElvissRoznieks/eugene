import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import SeoHead from '../components/SeoHead'
import FilmStageLoader from '../components/FilmStageLoader'
import {
  FilmSeoCatalog,
  filmCollectionJsonLd,
} from '../components/SeoCatalog'
import { PAGE_SEO } from '../data/site'

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

/**
 * Desktop Film: paint the shell first, then fetch Three.js / PosterWall
 * asynchronously with an explicit loading state (not on the critical path).
 */
function FilmDesktop() {
  const [PosterWall, setPosterWall] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let raf2 = 0

    // Two rAFs so Layout + SEO commit before we pull the ~900KB Three chunk
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        import('../components/PosterWall')
          .then((mod) => {
            if (!cancelled) setPosterWall(() => mod.default)
          })
          .catch(() => {
            if (!cancelled) setFailed(true)
          })
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [])

  if (failed) {
    return (
      <div className="film-stage-loader" role="alert">
        <p className="film-stage-loader__label">Gallery couldn’t load.</p>
        <button
          type="button"
          className="poster-wall__fallback-btn"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    )
  }

  if (!PosterWall) {
    return <FilmStageLoader label="Loading gallery" />
  }

  return <PosterWall />
}

export default function Film() {
  const mobile = useIsMobileFilm()
  const jsonLd = useMemo(() => filmCollectionJsonLd(), [])

  return (
    <Layout variant={mobile ? 'dark' : 'immersive'}>
      <SeoHead {...PAGE_SEO.film} jsonLd={jsonLd} />
      <FilmSeoCatalog />
      {mobile ? (
        <Suspense fallback={<FilmStageLoader label="Loading films" />}>
          <FilmMobile />
        </Suspense>
      ) : (
        <FilmDesktop />
      )}
    </Layout>
  )
}
