import { HERO_VIDEOS } from '../data/site'

/** Full-bleed hero video layer (local assets only). */
export default function VideoBackground({ activeIndex = 0 }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
      aria-hidden="true"
    >
      {HERO_VIDEOS.map((video, index) => (
        <video
          key={video.id}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-in-out ${
            activeIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          src={video.src}
          muted
          autoPlay
          playsInline
          loop
          preload={index === 0 ? 'auto' : 'metadata'}
          aria-hidden="true"
        />
      ))}
      <div className="absolute inset-0 z-[1] bg-black/15" />
    </div>
  )
}
