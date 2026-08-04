import { Link } from 'react-router-dom'
import { IMDB_URL, SITE_NAME } from '../data/site'
import useReveal from '../hooks/useReveal'

const FIRST_NAME = SITE_NAME.split(' ')[0]

export default function Hero() {
  const nameReveal = useReveal(0.35, { immediate: true })
  const copyReveal = useReveal(0.35, { immediate: true })

  return (
    <main className="relative z-[2] flex h-full min-h-screen w-full flex-col">
      <div className="mx-auto flex h-full w-full max-w-[1340px] flex-1 flex-col justify-end items-end gap-[150px] pt-[190px] px-[15px] mobile:items-start mobile:gap-[72px] mobile:px-[18px] mobile:pt-[140px] md-tablet:px-[18px]">
        <section
          className="flex w-full items-end justify-end gap-10 mobile:justify-start"
          aria-label="Availability"
        >
          <div
            className="flex items-center gap-2.5"
            role="status"
            aria-label="Availability"
          >
            <span className="availability-dot is-accent" />
            <span className="text-xs font-medium uppercase leading-4 tracking-[-0.12px]">
              Available for work
            </span>
          </div>
        </section>

        <section className="flex w-full items-end justify-between gap-[50px] pb-[100px] mobile:flex-col mobile:items-start mobile:gap-8 mobile:pb-24 md-tablet:gap-7 md-tablet:pb-[88px]">
          <div className="flex-[2]" ref={nameReveal.ref}>
            <h1
              className={`animate-reveal-up font-medium uppercase text-[200px] leading-[81%] tracking-[-6px] mobile:text-[clamp(68px,21vw,80px)] mobile:leading-[0.96] mobile:tracking-[-4.8px] md-tablet:text-[129.6px] md-tablet:leading-[113.4px] md-tablet:tracking-[-7.7px] ${
                nameReveal.visible ? 'is-visible' : ''
              }`}
            >
              {FIRST_NAME}
              <span className="text-[var(--accent)]">.</span>
            </h1>
          </div>

          <div
            className="flex flex-1 flex-col gap-6 pl-[50px] mobile:max-w-[420px] mobile:pl-0 md-tablet:pl-6"
            ref={copyReveal.ref}
          >
            <p
              className={`animate-reveal-right text-base font-medium leading-6 tracking-[-0.16px] text-white/90 ${
                copyReveal.visible ? 'is-visible' : ''
              }`}
            >
              Irish director and photographer exploring grief, family, identity
              and memory through cinematic storytelling and photographic
              portraiture.
            </p>

            <div
              className={`animate-reveal-right delay-cta flex flex-wrap gap-3 ${
                copyReveal.visible ? 'is-visible' : ''
              }`}
            >
              <Link
                to="/contact"
                className="project-btn inline-flex items-center px-6 py-3 text-xs font-medium uppercase tracking-[-0.12px]"
              >
                <span>start a project</span>
              </Link>
              <a
                href={IMDB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center border border-white/40 px-6 py-3 text-xs font-medium uppercase tracking-[-0.12px] transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                IMDb
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
