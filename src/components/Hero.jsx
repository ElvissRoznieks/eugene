import { IMDB_URL, SITE_NAME } from '../data/site'
import useReveal from '../hooks/useReveal'
import signature from '../assets/brand/eugene-brady-signature-white.png'
import imdbLogo from '../assets/imdb-logo.png'

export default function Hero() {
  const nameReveal = useReveal(0.35, { immediate: true })
  const copyReveal = useReveal(0.35, { immediate: true })

  return (
    <main className="relative z-[2] flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1340px] flex-1 flex-col justify-end items-end overflow-hidden pt-[190px] px-[15px] mobile:items-start mobile:justify-end mobile:px-[18px] mobile:pt-[4.5rem] mobile:pb-[max(0.65rem,env(safe-area-inset-bottom))] md-tablet:px-[18px]">
        <section className="flex w-full items-end justify-between gap-[50px] pb-[3.35rem] mobile:flex-col mobile:items-start mobile:gap-3.5 mobile:pb-0 md-tablet:gap-7 md-tablet:pb-11">
          <div className="flex-[2] self-center mobile:w-full mobile:max-w-[17.5rem] mobile:self-start" ref={nameReveal.ref}>
            <h1
              className={`hero-name animate-reveal-up ${
                nameReveal.visible ? 'is-visible' : ''
              }`}
            >
              <span className="seo-sr">{SITE_NAME}</span>
              <img
                src={signature}
                alt={`${SITE_NAME} signature`}
                className="hero-name__signature"
                width={992}
                height={280}
                decoding="async"
              />
            </h1>
          </div>

          <div
            className="flex flex-1 flex-col gap-6 pl-[50px] mobile:max-w-[420px] mobile:gap-3.5 mobile:pl-0 md-tablet:pl-6"
            ref={copyReveal.ref}
          >
            <div
              className={`hero-copy animate-reveal-right flex flex-col gap-4 text-base font-bold leading-6 tracking-[-0.16px] text-white/90 mobile:gap-2.5 mobile:text-[0.9375rem] mobile:leading-[1.45] ${
                copyReveal.visible ? 'is-visible' : ''
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                Director / Photographer
              </p>
              <p>
                Feature films include <em>The Nephew</em>, starring Pierce
                Brosnan, and <em>Missing Brendan</em>, starring Adam Brody.&nbsp;
                <em>The Girl Who Stayed</em>&nbsp;&nbsp;is currently in development.
              </p>
              <p>
                Exploring grief, family, identity and memory through cinematic
                storytelling and photographic portraiture.
              </p>
            </div>

            <div
              className={`animate-reveal-right delay-cta flex flex-wrap gap-3 ${
                copyReveal.visible ? 'is-visible' : ''
              }`}
            >
              <a
                href={IMDB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-imdb"
                aria-label={`${SITE_NAME} on IMDb`}
                title="IMDb"
              >
                <img
                  src={imdbLogo}
                  alt="IMDb"
                  className="hero-imdb__logo"
                  width={128}
                  height={64}
                  decoding="async"
                />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
