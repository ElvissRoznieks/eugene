import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function dismissPreloader() {
  const el = document.getElementById('preloader')
  if (!el || el.classList.contains('is-done')) return

  const minMs = 700
  const started = performance.now()

  const finish = () => {
    const wait = Math.max(0, minMs - (performance.now() - started))
    window.setTimeout(() => {
      el.classList.add('is-done')
      window.setTimeout(() => el.remove(), 700)
    }, wait)
  }

  if (document.readyState === 'complete') finish()
  else window.addEventListener('load', finish, { once: true })
}

dismissPreloader()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
