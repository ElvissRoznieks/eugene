import Layout from '../components/Layout'
import Hero from '../components/Hero'
import SeoHead, { personJsonLd } from '../components/SeoHead'
import { PAGE_SEO, SITE_OG_IMAGE } from '../data/site'

export default function Home() {
  return (
    <Layout variant="hero" activeIndex={0}>
      <SeoHead
        {...PAGE_SEO.home}
        jsonLd={personJsonLd({
          image: SITE_OG_IMAGE,
          knowsAbout: [
            'Film directing',
            'Portrait photography',
            'Narrative cinema',
          ],
        })}
      />
      <Hero />
    </Layout>
  )
}
