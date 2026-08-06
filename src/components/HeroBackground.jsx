import { HERO_IMAGE, HERO_IMAGE_ALT } from '../data/site'

/** Full-bleed hero still for the home page. */
export default function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
      aria-hidden="true"
    >
      <img
        src={HERO_IMAGE}
        alt={HERO_IMAGE_ALT}
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-0 z-[1] bg-black/15" />
    </div>
  )
}
