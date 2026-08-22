import { useEffect, useState } from 'react'

const languageStorageKey = 'boda_invitation_language'

export const invitationCopy = {
  en: {
    loadingAria: 'Loading invitation',
    loading: 'Preparing your invitation',
    privateEyebrow: 'Private invitation',
    privateTitle: <>This moment is<br /><em>only for our guests</em></>,
    privateBody: 'To open the invitation, you need the personal link we sent you. Check that it is complete or contact us to receive it again.',
    withLove: 'With love',
    unavailableEyebrow: 'One moment',
    unavailableTitle: <>We couldn’t open<br /><em>your invitation</em></>,
    unavailableBody: 'Check your connection and try again in a few minutes.',
    tryAgain: 'Try again',
    videoMessage: 'A story we want to share with you',
    videoLoading: 'Loading our message…',
    videoPause: 'Pause video',
    videoPlay: 'Play video',
    skipVideo: 'Skip to RSVP',
    dear: (name) => `Dear ${name}`,
    rsvpTitle: <>Will you join us<br /><em>on this special day?</em></>,
    rsvpBody: 'Your presence will make this celebration even more special.',
    yesAnswer: 'Yes, I’ll be there',
    yesDetail: 'I’ll celebrate with you',
    noAnswer: 'I can’t attend',
    noDetail: 'I’ll be with you in spirit',
    requestError: 'We could not save your response. Please try again.',
    previousAnswer: 'Your previous response was:',
    previousYes: 'I will attend',
    previousNo: 'I cannot attend',
    responseReceived: 'Response received',
    attendingTitle: (name) => <>We’re so happy,<br /><em>{name}!</em></>,
    decliningTitle: <>Thank you<br /><em>for letting us know</em></>,
    attendingBody: 'We’re delighted that you’ll share this chapter with us. We’ll send all the details soon.',
    decliningBody: 'We’ll miss having you close, but we know you’ll be celebrating with us in spirit.',
    saveDate: 'Save the date',
    changeResponse: 'Change my response',
    welcomeEyebrow: 'We have something to tell you',
    gettingMarried: 'We’re getting married',
    guestFor: 'An invitation especially for',
    countdownLabels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
    countdownAria: ({ days, hours, minutes, seconds }) => `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds remaining`,
    savedYes: 'Your response is saved: you will attend.',
    savedNo: 'Your response is saved: you cannot attend.',
    sound: 'Turn up the sound to enjoy the experience',
    photoLabel: 'Photo of Annie and Jonathan',
    photoAlt: 'Annie and Jonathan',
    photoPlaceholder: 'Couple’s photograph',
    comingSoon: 'Coming soon',
    openAgain: 'Watch the invitation again',
    openInvitation: 'Open the invitation and respond',
  },
  es: {
    loadingAria: 'Cargando invitación',
    loading: 'Preparando tu invitación',
    privateEyebrow: 'Invitación privada',
    privateTitle: <>Este momento es<br /><em>solo para nuestros invitados</em></>,
    privateBody: 'Para abrir la invitación necesitas el enlace personal que te enviamos. Revisa que esté completo o escríbenos para recibirlo de nuevo.',
    withLove: 'Con cariño',
    unavailableEyebrow: 'Un momento',
    unavailableTitle: <>No pudimos abrir<br /><em>tu invitación</em></>,
    unavailableBody: 'Comprueba tu conexión e inténtalo de nuevo en unos minutos.',
    tryAgain: 'Intentar de nuevo',
    videoMessage: 'Una historia que queremos compartir contigo',
    videoLoading: 'Cargando nuestro mensaje…',
    videoPause: 'Pausar video',
    videoPlay: 'Reproducir video',
    skipVideo: 'Saltar al RSVP',
    dear: (name) => `Querido/a ${name}`,
    rsvpTitle: <>¿Nos acompañas<br /><em>en este día?</em></>,
    rsvpBody: 'Tu presencia hará que esta celebración sea todavía más especial.',
    yesAnswer: 'Sí, allí estaré',
    yesDetail: 'Celebraré con ustedes',
    noAnswer: 'No podré asistir',
    noDetail: 'Los acompañaré de corazón',
    requestError: 'No pudimos guardar tu respuesta. Inténtalo de nuevo.',
    previousAnswer: 'Tu respuesta anterior fue:',
    previousYes: 'Sí asistiré',
    previousNo: 'No podré asistir',
    responseReceived: 'Respuesta recibida',
    attendingTitle: (name) => <>¡Qué alegría,<br /><em>{name}!</em></>,
    decliningTitle: <>Gracias por<br /><em>respondernos</em></>,
    attendingBody: 'Nos emociona saber que compartirás este capítulo con nosotros. Pronto recibirás todos los detalles.',
    decliningBody: 'Sentiremos no tenerte cerca, pero sabemos que nos acompañarás con todo tu cariño.',
    saveDate: 'Guarda la fecha',
    changeResponse: 'Cambiar mi respuesta',
    welcomeEyebrow: 'Tenemos algo que contarte',
    gettingMarried: 'Nos casamos',
    guestFor: 'Una invitación especialmente para',
    countdownLabels: { days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' },
    countdownAria: ({ days, hours, minutes, seconds }) => `Faltan ${days} días, ${hours} horas, ${minutes} minutos y ${seconds} segundos`,
    savedYes: 'Tu respuesta está guardada: sí asistirás.',
    savedNo: 'Tu respuesta está guardada: no podrás asistir.',
    sound: 'Prepara el sonido para disfrutar la experiencia',
    photoLabel: 'Fotografía de Annie y Jonathan',
    photoAlt: 'Annie y Jonathan',
    photoPlaceholder: 'Fotografía de la pareja',
    comingSoon: 'Próximamente',
    openAgain: 'Volver a ver la invitación',
    openInvitation: 'Abrir la invitación y responder',
  },
}

function savedLanguage() {
  return window.localStorage.getItem(languageStorageKey) === 'es' ? 'es' : 'en'
}

export function useInvitationLanguage() {
  const [language, setLanguageState] = useState(savedLanguage)

  useEffect(() => {
    const previousLanguage = document.documentElement.lang
    document.documentElement.lang = language
    return () => { document.documentElement.lang = previousLanguage }
  }, [language])

  function setLanguage(value) {
    const nextLanguage = value === 'es' ? 'es' : 'en'
    window.localStorage.setItem(languageStorageKey, nextLanguage)
    setLanguageState(nextLanguage)
  }

  return [language, setLanguage]
}
