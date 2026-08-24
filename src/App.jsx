import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Film = lazy(() => import('./pages/Film'))
const Photography = lazy(() => import('./pages/Photography'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/film" element={<Film />} />
          <Route path="/films" element={<Navigate to="/film" replace />} />
          <Route path="/photography" element={<Photography />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
