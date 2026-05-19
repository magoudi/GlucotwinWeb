import { Link } from 'react-router-dom'

type LogoProps = {
  dark?: boolean
  to?: string
}

export function Logo({ dark = false, to }: LogoProps) {
  const mark = (
    <div className="flex items-center gap-3.5">
      <div className="flex size-[46px] shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#25c2a0] to-[#2f6fee]">
        <span className="text-2xl leading-[1.3] font-bold text-white">G</span>
      </div>
      <span className={`text-[28px] leading-[1.3] font-extrabold ${dark ? 'text-white': 'text-[#102326]' }`}>
        GlucoTwin
      </span>
    </div>
  )

  if (!to) {
    return mark
  }

  return (
    <Link to={to} aria-label="GlucoTwin home">
      {mark}
    </Link>
  )
}
