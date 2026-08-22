import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, Heart, X } from 'lucide-react'
import { api } from '../lib/api'
import BrandMark from '../components/BrandMark'
import FloralCorner from '../components/FloralCorner'
import LoadingScreen from '../components/LoadingScreen'
import PrivatePage from './PrivatePage'
import YouTubeVideo from '../components/YouTubeVideo'

const weddingDate = '14 · 11 · 2026'

export default function InvitationPage() {
  const { token } = useParams()
  const [invitation, setInvitation] = useState(null)
  const [stage, setStage] = useState('loading')
  const [decision, setDecision] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
      else setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === 'loading') return <LoadingScreen />
  if (stage === 'private') return <PrivatePage />
  if (stage === 'unavailable') {
    return (
      <main className="center-page paper-bg">
        <BrandMark />
        <p className="eyebrow">Un momento</p>
        <h1>No pudimos abrir<br /><em>tu invitación</em></h1>
        <p className="body-copy narrow">Comprueba tu conexión e inténtalo de nuevo en unos minutos.</p>
        <button className="primary-button" onClick={() => window.location.reload()}>Intentar de nuevo</button>
      </main>
    )
  }

  if (stage === 'video') {
    return (
      <main className="video-page">
        <header className="video-header"><BrandMark light /><p>Una historia que queremos compartir contigo</p></header>
        <YouTubeVideo onComplete={finishVideo} />
        <button className="skip-button" onClick={finishVideo}>Saltar al RSVP <ArrowRight size={15} /></button>
      </main>
    )
  }

  if (stage === 'rsvp') {
    return (
      <main className="center-page paper-bg rsvp-page">
        <FloralCorner />
        <FloralCorner position="bottom" />
        <BrandMark />
        <p className="eyebrow">Querido/a {invitation.name}</p>
        <h1>¿Nos acompañas<br /><em>en este día?</em></h1>
        <p className="body-copy narrow">Tu presencia hará que esta celebración sea todavía más especial.</p>
        <div className="rsvp-actions">
          <button disabled={submitting} className="answer-card answer-card--yes" onClick={() => submitRsvp('yes')}>
            <span><Check size={25} /></span>
            <strong>Sí, allí estaré</strong>
            <small>Celebraré con ustedes</small>
          </button>
          <button disabled={submitting} className="answer-card" onClick={() => submitRsvp('no')}>
            <span><X size={25} /></span>
            <strong>No podré asistir</strong>
            <small>Los acompañaré de corazón</small>
          </button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {decision && <p className="previous-answer">Tu respuesta anterior fue: <b>{decision === 'yes' ? 'Sí asistiré' : 'No podré asistir'}</b></p>}
      </main>
    )
  }

  if (stage === 'confirmed') {
    const attending = decision === 'yes'
    return (
      <main className="center-page paper-bg confirmation-page">
        <FloralCorner />
        <FloralCorner position="bottom" />
        <BrandMark />
        <div className="icon-seal icon-seal--heart"><Heart size={23} fill="currentColor" /></div>
        <p className="eyebrow">Respuesta recibida</p>
        <h1>{attending ? <>¡Qué alegría,<br /><em>{invitation.name}!</em></> : <>Gracias por<br /><em>respondernos</em></>}</h1>
        <p className="body-copy narrow">
          {attending
            ? 'Nos emociona saber que compartirás este capítulo con nosotros. Pronto recibirás todos los detalles.'
            : 'Sentiremos no tenerte cerca, pero sabemos que nos acompañarás con todo tu cariño.'}
        </p>
        {attending && <div className="date-card"><CalendarDays size={19} /><span>Guarda la fecha</span><strong>{weddingDate}</strong></div>}
        <button className="text-button" onClick={() => setStage('rsvp')}>Cambiar mi respuesta</button>
        <p className="couple-signature">Annie &amp; Jonathan</p>
      </main>
    )
  }

  return (
    <main className="welcome-page paper-bg">
      <FloralCorner />
      <FloralCorner position="bottom" />
      <section className="welcome-content">
        <BrandMark />
        <p className="eyebrow">Tenemos algo que contarte</p>
        <div className="names-lockup"><span>Annie</span><b>&amp;</b><span>Jonathan</span></div>
        <p className="getting-married">Nos casamos</p>
        <div className="date-line"><span />{weddingDate}<span /></div>
        <div className="guest-note">
          <p>Una invitación especialmente para</p>
          <strong>{invitation.name}</strong>
        </div>
        {decision && <p className="response-saved">Tu respuesta está guardada: {decision === 'yes' ? 'sí asistirás' : 'no podrás asistir'}.</p>}
        <button className="primary-button" onClick={() => setStage('video')}>
          {decision ? 'Volver a ver la invitación' : 'Abrir nuestra invitación'} <ArrowRight size={17} />
        </button>
        {decision && <button className="text-button" onClick={() => setStage('rsvp')}>Cambiar mi respuesta</button>}
        <p className="sound-copy">Prepara el sonido para disfrutar la experiencia</p>
      </section>
    </main>
  )
}
