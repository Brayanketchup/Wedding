import BrandMark from './BrandMark'
import LanguageSwitch from './LanguageSwitch'

export default function LoadingScreen({ copy, language, onLanguageChange }) {
  return (
    <main className="center-page paper-bg" lang={language}>
      <LanguageSwitch language={language} onChange={onLanguageChange} />
      <BrandMark />
      <div className="loading-line" aria-label={copy.loadingAria}><span /></div>
      <p className="eyebrow">{copy.loading}</p>
    </main>
  )
}
