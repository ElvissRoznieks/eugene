/** Full-stage loader while the Film desktop Three.js chunk boots. */
export default function FilmStageLoader({
  label = 'Loading gallery',
  phase = 'fetch',
}) {
  return (
    <div
      className="film-stage-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="film-stage-loader__icon" aria-hidden="true">
        <svg
          className="film-stage-loader__spinner"
          viewBox="0 0 48 48"
          width="40"
          height="40"
        >
          <circle
            className="film-stage-loader__track"
            cx="24"
            cy="24"
            r="18"
            fill="none"
            strokeWidth="2.5"
          />
          <circle
            className="film-stage-loader__arc"
            cx="24"
            cy="24"
            r="18"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="film-stage-loader__label">{label}</p>
      <p className="film-stage-loader__phase" data-phase={phase}>
        {phase === 'idle' || phase === 'paint'
          ? 'Preparing'
          : phase === 'mount'
            ? 'Starting'
            : 'Downloading'}
      </p>
    </div>
  )
}
