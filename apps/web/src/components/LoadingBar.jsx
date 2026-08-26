export default function LoadingBar({ label, ariaLabel = label, light = false, compact = false }) {
  return (
    <div
      className={`loading-indicator ${light ? 'loading-indicator--light' : ''} ${compact ? 'loading-indicator--compact' : ''}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="loading-line" aria-hidden="true"><span /></div>
      {label && <p>{label}</p>}
    </div>
  )
}
