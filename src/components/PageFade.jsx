import { useLocation } from 'react-router-dom'
import { useLayoutEffect } from 'react'

/** Soft enter animation + scroll reset so each page flows in. */
export default function PageFade({ children }) {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  )
}
