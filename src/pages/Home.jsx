import Layout from '../components/Layout'
import Hero from '../components/Hero'
import SeoHead, { personJsonLd, websiteJsonLd } from '../components/SeoHead'
import { PAGE_SEO, SITE_OG_IMAGE } from '../data/site'

export default function Home() {
  return (
    <Layout variant="hero">
      <SeoHead
        {...PAGE_SEO.home}
        jsonLd={[
          websiteJsonLd(),
          personJsonLd({
            image: SITE_OG_IMAGE,
            knowsAbout: [
              'Film directing',
              'Portrait photography',
              'Narrative cinema',
              'Feature film',
            ],
          }),
        ]}
      />
      <Hero />
    </Layout>
  )
}
