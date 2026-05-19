import { Link } from 'react-router-dom'
import { Logo } from './Logo'

type PublicNavProps = {
  dark?: boolean
}

export function PublicNav({ dark = false }: PublicNavProps) {
  return (
    <header className={`absolute inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
      dark 
        ? 'border-white/10 bg-[#0B1120]/80 backdrop-blur-md text-white' 
        : 'border-[#d8e6e4] bg-[#f3faf9] text-[#405459]'
    }`}>
      <div className="mx-auto flex h-[94px] max-w-[1430px] items-center justify-between px-6 lg:px-10">
        <Logo dark={dark} to="/" />
        <nav className={`hidden items-center gap-9 text-[16px] font-extrabold lg:flex ${
          dark ? 'text-slate-300' : 'text-[#405459]'
        }`}>
          <a href="#digital-twin" className="hover:text-emerald-400 transition-colors">Digital twin</a>
          <a href="#patients" className="hover:text-emerald-400 transition-colors">For patients</a>
          <a href="#clinicians" className="hover:text-emerald-400 transition-colors">Clinicians</a>
          <a href="#security" className="hover:text-emerald-400 transition-colors">Security</a>
        </nav>
        <nav className="flex items-center gap-8">
          <Link
            className={`hidden rounded-lg px-7 py-4 text-[16px] font-extrabold sm:block transition-all duration-300 ${
              dark 
                ? 'text-white border border-white/10 bg-white/5 hover:bg-white/10' 
                : 'border border-[#d5e3e1] bg-white text-[#536b6b] hover:text-[#102326]'
            }`}
            to="/login"
          >
            Log in
          </Link>
          <Link
            className={`rounded-lg px-7 py-4 text-[16px] font-extrabold text-white transition-all duration-300 shadow-md hover:-translate-y-0.5 ${
              dark
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-[0_4px_15px_rgba(16,185,129,0.4)]'
                : 'bg-[#102326]'
            }`}
            to="/create-account"
          >
            Start twin
          </Link>
        </nav>
      </div>
    </header>
  )
}
