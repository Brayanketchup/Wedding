export default function BrandMark({ light = false }) {
  return (
    <div className={`brand-mark ${light ? 'brand-mark--light' : ''}`} aria-label="Annie y Jonathan">
      <span>A</span>
      <i aria-hidden="true" />
      <span>J</span>
    </div>
  )
}
