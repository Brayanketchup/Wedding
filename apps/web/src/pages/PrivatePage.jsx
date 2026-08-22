import { LockKeyhole } from 'lucide-react'
import BrandMark from '../components/BrandMark'
import FloralCorner from '../components/FloralCorner'
import LanguageSwitch from '../components/LanguageSwitch'
import { invitationCopy, useInvitationLanguage } from '../lib/invitationLanguage'

export default function PrivatePage() {
  const [language, setLanguage] = useInvitationLanguage()
  const copy = invitationCopy[language]

  return (
    <main className="center-page paper-bg private-page" lang={language}>
      <LanguageSwitch language={language} onChange={setLanguage} />
      <FloralCorner />
      <FloralCorner position="bottom" />
      <BrandMark />
      <div className="icon-seal"><LockKeyhole size={22} strokeWidth={1.5} /></div>
      <p className="eyebrow">{copy.privateEyebrow}</p>
      <h1>{copy.privateTitle}</h1>
      <p className="body-copy narrow">{copy.privateBody}</p>
      <div className="fine-rule"><span>{copy.withLove}</span></div>
      <p className="couple-signature">Annie &amp; Jonathan</p>
    </main>
  )
}
