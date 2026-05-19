import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

type AuthLayoutProps = {
  children: ReactNode
  heroTitle?: string
  heroDescription?: string
  stats?: Array<{
    label: string
    value: string
  }>
}

const defaultStats = [
  { value: '112 mg/dL', label: 'Stable and in range' },
  { value: '92%', label: 'Twin confidence' },
]

export function AuthLayout({
  children,
  heroTitle = 'Welcome back to your living glucose model.',
  heroDescription = 'Review forecasts, compare treatment scenarios, and share explainable summaries with your care team.',
  stats = defaultStats,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen bg-[#0B1120] lg:grid-cols-[60fr_40fr] 2xl:grid-cols-[64fr_36fr]">
      <section className="hidden bg-[#0B1120] border-r border-white/10 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-16 2xl:px-[102px] 2xl:py-[102px]">
        <Logo to="/" dark/>
        <div className="lg:-mt-4 2xl:-mt-8">
          <h1 className="max-w-[980px] text-[clamp(3rem,4.6vw,4.625rem)] leading-[1.05] font-extrabold text-white">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-[760px] text-[clamp(1.125rem,1.55vw,1.5rem)] leading-[1.45] font-medium text-[#c7dada] 2xl:mt-9">
            {heroDescription}
          </p>
        </div>
        <div className="grid max-w-[800px] grid-cols-2 gap-4 2xl:gap-6">
          {stats.map((stat) => (
            <div key={stat.value} className="rounded-lg border border-white/20 bg-white/[0.08] px-5 py-5 2xl:px-8 2xl:py-7">
              <p className="text-[clamp(1.5rem,2vw,1.875rem)] font-extrabold text-white">{stat.value}</p>
              <p className="mt-2 text-base font-medium text-[#c7dada] 2xl:mt-3 2xl:text-[18px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-[#0B1120] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,194,160,0.15),rgba(255,255,255,0))] px-6 py-10">
        <div className="w-full max-w-[552px] rounded-lg border border-white/10 bg-white/5 backdrop-blur-md px-6 py-8 shadow-2xl shadow-black/50 sm:px-8 lg:px-9 lg:py-10 2xl:px-12 2xl:py-14">
          <Link className="mb-9 flex items-center gap-3 lg:hidden" to="/">
            <Logo dark />
          </Link>
          {children}
        </div>
      </section>
    </main>
  )
}
