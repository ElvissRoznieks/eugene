import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Load built CSS without blocking first paint (Lighthouse render-blocking). */
function asyncCss() {
  return {
    name: 'async-css',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(
          /<link([^>]*\s)?rel="stylesheet"([^>]*\s)?href="([^"]+\.css)"([^>]*)\/?>/g,
          (_m, pre = '', mid = '', href, post = '') =>
            `<link rel="preload" as="style" href="${href}" />` +
            `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'" />` +
            `<noscript><link rel="stylesheet" href="${href}" /></noscript>`
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), asyncCss()],
})
