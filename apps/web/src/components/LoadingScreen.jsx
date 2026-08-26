import BrandMark from './BrandMark'
import LanguageSwitch from './LanguageSwitch'
import LoadingBar from './LoadingBar'

export default function LoadingScreen({ copy, language, onLanguageChange }) {
  return (
    <main className="center-page paper-bg" lang={language}>
      <LanguageSwitch language={language} onChange={onLanguageChange} />
      <BrandMark />
      <LoadingBar label={copy.loading} ariaLabel={copy.loadingAria} />
    </main>
  )
}
