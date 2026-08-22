export default function LanguageSwitch({ language, onChange }) {
  return (
    <div className="language-switch" role="group" aria-label={language === 'en' ? 'Select language' : 'Seleccionar idioma'}>
      <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => onChange('en')} aria-pressed={language === 'en'}>EN</button>
      <span aria-hidden="true" />
      <button type="button" className={language === 'es' ? 'active' : ''} onClick={() => onChange('es')} aria-pressed={language === 'es'}>ES</button>
    </div>
  )
}
