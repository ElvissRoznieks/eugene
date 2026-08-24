import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Avoid render-blocking CSS: preload the stylesheet, then promote it
 * to rel=stylesheet on load (standard Lighthouse-friendly pattern).
 */
function asyncCss() {
  return {
    name: 'async-css',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /<link[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+\.css)["'][^>]*>/gi,
          (_m, href) =>
            `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'" />` +
            `<noscript><link rel="stylesheet" href="${href}" /></noscript>`
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), asyncCss()],
  build: {
    modulePreload: {
      resolveDependencies: (filename, deps, { hostType }) => {
        // HTML entry must not preload route-only / Three chunks.
        if (hostType !== 'html') return deps
        return deps.filter(
          (dep) =>
            !dep.includes('three') &&
            !dep.includes('PosterWall') &&
            !dep.includes('FilmMobile') &&
            !dep.includes('/Film-') &&
            !dep.includes('Photography') &&
            !dep.includes('/About-') &&
            !dep.includes('/Contact-') &&
            !dep.includes('/Home-')
        )
      },
    },
  },
})
