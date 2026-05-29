import { Link } from 'react-router-dom'

type LogoProps = {
  dark?: boolean
  to?: string
  className?: string
}

export function Logo({ dark = false, to, className }: LogoProps) {
  const mark = (
    <div className={`flex items-center gap-3.5 ${className ?? ''}`}>
      <div className="flex size-[46px] shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#2455e8] to-[#4f7bff]">
        <span className="text-2xl leading-[1.3] font-bold text-gray-900">G</span>
      </div>
      <span className={`text-[28px] leading-[1.3] font-extrabold ${dark ? 'text-gray-900': 'text-[#111111]' }`}>
        GlucoTwin
      </span>
    </div>
  )

  if (!to) {
    return mark
  }

  return (
    <Link to={to} aria-label="GlucoTwin home" className={className}>
      {mark}
    </Link>
  )
}
