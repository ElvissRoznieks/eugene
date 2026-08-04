import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Film from './pages/Film'
import Photography from './pages/Photography'
import About from './pages/About'
import Contact from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/film" element={<Film />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}
