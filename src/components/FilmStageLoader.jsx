/** Full-stage loader while the Film desktop Three.js chunk boots. */
export default function FilmStageLoader({ label = 'Loading gallery' }) {
  return (
    <div
      className="film-stage-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="film-stage-loader__mark" aria-hidden="true" />
      <p className="film-stage-loader__label">{label}</p>
    </div>
  )
}
