import { lazy, startTransition, Suspense, useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import SeoHead from '../components/SeoHead'
import FilmStageLoader from '../components/FilmStageLoader'
import {
  FilmSeoCatalog,
  filmCollectionJsonLd,
} from '../components/SeoCatalog'
import { PAGE_SEO } from '../data/site'
import { loadPosterWallAsync } from '../utils/load-poster-wall'

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
 * Desktop Film: shell + loading icon first.
 * Three.js / PosterWall load only after paint + idle — zero critical-path block.
 */
function FilmDesktop() {
  const [PosterWall, setPosterWall] = useState(null)
  const [phase, setPhase] = useState('paint')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const ac = new AbortController()

    loadPosterWallAsync({
      signal: ac.signal,
      onPhase: setPhase,
    })
      .then((Comp) => {
        startTransition(() => {
          setPosterWall(() => Comp)
        })
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setFailed(true)
      })

    return () => ac.abort()
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
    return (
      <FilmStageLoader
        label="Loading gallery"
        phase={phase}
      />
    )
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
