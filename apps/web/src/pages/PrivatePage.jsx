import { LockKeyhole } from 'lucide-react'
import BrandMark from '../components/BrandMark'
import FloralCorner from '../components/FloralCorner'

export default function PrivatePage() {
  return (
    <main className="center-page paper-bg private-page">
      <FloralCorner />
      <FloralCorner position="bottom" />
      <BrandMark />
      <div className="icon-seal"><LockKeyhole size={22} strokeWidth={1.5} /></div>
      <p className="eyebrow">Invitación privada</p>
      <h1>Este momento es<br /><em>solo para nuestros invitados</em></h1>
      <p className="body-copy narrow">Para abrir la invitación necesitas el enlace personal que te enviamos. Revisa que esté completo o escríbenos para recibirlo de nuevo.</p>
      <div className="fine-rule"><span>Con cariño</span></div>
      <p className="couple-signature">Annie &amp; Jonathan</p>
    </main>
  )
}
