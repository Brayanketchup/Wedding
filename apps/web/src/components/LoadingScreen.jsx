import BrandMark from './BrandMark'

export default function LoadingScreen() {
  return (
    <main className="center-page paper-bg">
      <BrandMark />
      <div className="loading-line" aria-label="Cargando invitación"><span /></div>
      <p className="eyebrow">Preparando tu invitación</p>
    </main>
  )
}
