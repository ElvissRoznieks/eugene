import { IMDB_URL, SITE_NAME } from '../data/site'
import useReveal from '../hooks/useReveal'
import signature from '../assets/brand/eugene-brady-signature-white.png'
import imdbLogo from '../assets/imdb-logo.png'

export default function Hero() {
  const nameReveal = useReveal(0.35, { immediate: true })
  const copyReveal = useReveal(0.35, { immediate: true })

  return (
    <main className="relative z-[2] flex h-full min-h-screen w-full flex-col">
      <div className="mx-auto flex h-full w-full max-w-[1340px] flex-1 flex-col justify-end items-end pt-[190px] px-[15px] mobile:items-start mobile:px-[18px] mobile:pt-[140px] md-tablet:px-[18px]">
        <section className="flex w-full items-end justify-between gap-[50px] pb-[3.35rem] mobile:flex-col mobile:items-start mobile:gap-8 mobile:pb-11 md-tablet:gap-7 md-tablet:pb-11">
          <div className="flex-[2]" ref={nameReveal.ref}>
            <h1
              className={`hero-name animate-reveal-up ${
                nameReveal.visible ? 'is-visible' : ''
              }`}
            >
              <span className="sr-only">{SITE_NAME}</span>
              <img
                src={signature}
                alt=""
                className="hero-name__signature"
                width={992}
                height={280}
                decoding="async"
              />
            </h1>
          </div>

          <div
            className="flex flex-1 flex-col gap-6 pl-[50px] mobile:max-w-[420px] mobile:pl-0 md-tablet:pl-6"
            ref={copyReveal.ref}
          >
            <div
              className={`hero-copy animate-reveal-right flex flex-col gap-4 text-base font-bold leading-6 tracking-[-0.16px] text-white/90 ${
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
                  alt=""
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
