export default function FloralCorner({ position = 'top' }) {
  return (
    <svg className={`floral floral--${position}`} viewBox="0 0 250 250" aria-hidden="true">
      <path d="M18 232C51 175 70 116 70 20" />
      <path d="M57 151c-31-1-43-18-45-43 27 0 43 14 45 43Z" />
      <path d="M69 113c24-6 36-24 34-49-25 5-37 21-34 49Z" />
      <path d="M48 184c-25 3-41-10-49-31 24-4 41 7 49 31Z" />
      <path d="M70 73c-18-13-23-32-14-53 19 12 24 30 14 53Z" />
      <circle cx="104" cy="61" r="3" />
      <circle cx="9" cy="106" r="3" />
      <circle cx="2" cy="151" r="2" />
    </svg>
  )
}
