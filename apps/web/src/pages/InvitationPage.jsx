import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, Heart, X } from 'lucide-react'
import { api } from '../lib/api'
import BrandMark from '../components/BrandMark'
import FloralCorner from '../components/FloralCorner'
import LanguageSwitch from '../components/LanguageSwitch'
import LoadingScreen from '../components/LoadingScreen'
import PrivatePage from './PrivatePage'
import ResponsiveMuxVideo from '../components/ResponsiveMuxVideo'
import { invitationCopy, useInvitationLanguage } from '../lib/invitationLanguage'

function formatWeddingDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value)
  if (!match) return value
  return `${match[3]} · ${match[2]} · ${match[1]}`
}

function weddingTimestamp(value) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime()
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

function countdownTo(value) {
  const timestamp = weddingTimestamp(value)
  if (timestamp === null) return null

  const secondsRemaining = Math.max(0, Math.floor((timestamp - Date.now()) / 1000))
  return {
    days: Math.floor(secondsRemaining / 86400),
    hours: Math.floor((secondsRemaining % 86400) / 3600),
    minutes: Math.floor((secondsRemaining % 3600) / 60),
    seconds: secondsRemaining % 60,
  }
}

function WeddingCountdown({ date, copy }) {
  const [remaining, setRemaining] = useState(() => countdownTo(date))

  useEffect(() => {
    setRemaining(countdownTo(date))
    const interval = window.setInterval(() => setRemaining(countdownTo(date)), 1000)
    return () => window.clearInterval(interval)
  }, [date])

  if (!remaining) return null
  const units = [['days', 3], ['hours', 2], ['minutes', 2], ['seconds', 2]]

  return (
    <div className="wedding-countdown" aria-label={copy.countdownAria(remaining)}>
      {units.map(([key, length]) => (
        <div className="countdown-unit" key={key}>
          <strong>{String(remaining[key]).padStart(length, '0')}</strong>
          <small>{copy.countdownLabels[key]}</small>
        </div>
      ))}
    </div>
  )
}

const weddingDateValue = import.meta.env.VITE_WEDDING_DATE || '2026-11-14'
const weddingDate = formatWeddingDate(weddingDateValue)

export default function InvitationPage() {
  const { token } = useParams()
  const [language, setLanguage] = useInvitationLanguage()
  const copy = invitationCopy[language]
  const [invitation, setInvitation] = useState(null)
  const [stage, setStage] = useState('loading')
  const [decision, setDecision] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [weddingImageReady, setWeddingImageReady] = useState(false)
  const weddingImageUrl = import.meta.env.VITE_WEDDING_IMAGE_URL || '/wedding-photo.jpg'

  useEffect(() => {
    let active = true
    api(`/api/invitations/${encodeURIComponent(token || '')}`)
      .then(({ invitation: found }) => {
        if (!active) return
        setInvitation(found)
        setDecision(found.decision === 'pending' ? null : found.decision)
        setStage('welcome')
      })
      .catch((requestError) => {
        if (!active) return
        setStage(requestError.status === 404 ? 'private' : 'unavailable')
      })
    return () => { active = false }
  }, [token])

  const finishVideo = useCallback(() => setStage('rsvp'), [])

  async function submitRsvp(answer) {
    setSubmitting(true)
    setError('')
    try {
      const result = await api(`/api/invitations/${encodeURIComponent(token)}/rsvp`, {
        method: 'POST',
        body: JSON.stringify({ decision: answer }),
      })
      setInvitation(result.invitation)
      setDecision(answer)
      setStage('confirmed')
    } catch (requestError) {
      if (requestError.status === 404) setStage('private')
      else setError(copy.requestError)
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === 'loading') return <LoadingScreen copy={copy} language={language} onLanguageChange={setLanguage} />
  if (stage === 'private') return <PrivatePage />
  if (stage === 'unavailable') {
    return (
      <main className="center-page paper-bg" lang={language}>
        <LanguageSwitch language={language} onChange={setLanguage} />
        <BrandMark />
        <p className="eyebrow">{copy.unavailableEyebrow}</p>
        <h1>{copy.unavailableTitle}</h1>
        <p className="body-copy narrow">{copy.unavailableBody}</p>
        <button className="primary-button" onClick={() => window.location.reload()}>{copy.tryAgain}</button>
      </main>
    )
  }

  if (stage === 'video') {
    return (
      <main className="video-page" lang={language}>
        <header className="video-header">
          <BrandMark light />
          <p>{copy.videoMessage}</p>
          <LanguageSwitch language={language} onChange={setLanguage} />
        </header>
        <ResponsiveMuxVideo onComplete={finishVideo} copy={copy} />
        <button className="skip-button" onClick={finishVideo}>{copy.skipVideo} <ArrowRight size={15} /></button>
      </main>
    )
  }

  if (stage === 'rsvp') {
    return (
      <main className="center-page paper-bg rsvp-page" lang={language}>
        <LanguageSwitch language={language} onChange={setLanguage} />
        <FloralCorner />
        <FloralCorner position="bottom" />
        <BrandMark />
        <p className="eyebrow">{copy.dear(invitation.name)}</p>
        <h1>{copy.rsvpTitle}</h1>
        <p className="body-copy narrow">{copy.rsvpBody}</p>
        <div className="rsvp-actions">
          <button disabled={submitting} className="answer-card answer-card--yes" onClick={() => submitRsvp('yes')}>
            <span><Check size={25} /></span>
            <strong>{copy.yesAnswer}</strong>
            <small>{copy.yesDetail}</small>
          </button>
          <button disabled={submitting} className="answer-card" onClick={() => submitRsvp('no')}>
            <span><X size={25} /></span>
            <strong>{copy.noAnswer}</strong>
            <small>{copy.noDetail}</small>
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {decision && <p className="previous-answer">{copy.previousAnswer} <b>{decision === 'yes' ? copy.previousYes : copy.previousNo}</b></p>}
      </main>
    )
  }

  if (stage === 'confirmed') {
    const attending = decision === 'yes'
    return (
      <main className="center-page paper-bg confirmation-page" lang={language}>
        <LanguageSwitch language={language} onChange={setLanguage} />
        <FloralCorner />
        <FloralCorner position="bottom" />
        <BrandMark />
        <div className="icon-seal icon-seal--heart"><Heart size={23} fill="currentColor" /></div>
        <p className="eyebrow">{copy.responseReceived}</p>
        <h1>{attending ? copy.attendingTitle(invitation.name) : copy.decliningTitle}</h1>
        <p className="body-copy narrow">
          {attending
            ? copy.attendingBody
            : copy.decliningBody}
        </p>
        {attending && (
          <>
            <div className="date-card"><CalendarDays size={19} /><span>{copy.saveDate}</span><strong>{weddingDate}</strong></div>
            <WeddingCountdown date={weddingDateValue} copy={copy} />
          </>
        )}
        <button className="text-button" onClick={() => setStage('rsvp')}>{copy.changeResponse}</button>
        <p className="couple-signature">Annie &amp; Jonathan</p>
      </main>
    )
  }

  return (
    <main className="welcome-page" lang={language}>
      <LanguageSwitch language={language} onChange={setLanguage} />
      <section className="welcome-invitation paper-bg">
        <FloralCorner />
        <FloralCorner position="bottom" />
        <div className="welcome-content">
          <BrandMark />
          <p className="eyebrow">{copy.welcomeEyebrow}</p>
          <div className="names-lockup"><span>Annie</span><b>&amp;</b><span>Jonathan</span></div>
          <p className="getting-married">{copy.gettingMarried}</p>
          <div className="guest-note">
            <p>{copy.guestFor}</p>
            <strong>{invitation.name}</strong>
          </div>
          {decision && <p className="response-saved">{decision === 'yes' ? copy.savedYes : copy.savedNo}</p>}
          {decision && <button className="text-button" onClick={() => setStage('rsvp')}>{copy.changeResponse}</button>}
          <p className="sound-copy">{copy.sound}</p>
        </div>
      </section>
      <section className={`welcome-photo ${weddingImageReady ? 'welcome-photo--ready' : ''}`} aria-label={copy.photoLabel}>
        <div className="photo-placeholder" aria-hidden="true">
          <Heart size={31} strokeWidth={1.25} />
          <span>{copy.photoPlaceholder}</span>
          <small>{copy.comingSoon}</small>
        </div>
        <img src={weddingImageUrl} alt={weddingImageReady ? copy.photoAlt : ''} onLoad={() => setWeddingImageReady(true)} onError={() => setWeddingImageReady(false)} />
        <button className="welcome-rsvp-button" onClick={() => setStage('video')} aria-label={decision ? copy.openAgain : copy.openInvitation}>
          <span>RSVP</span>
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  )
}
