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
  { value: 'Protected', label: 'Healthcare-grade privacy' },
  { value: 'Zero trust', label: 'End-to-end encrypted' },
]

export function AuthLayout({
  children,
  heroTitle = 'AI-powered personalized diabetes digital twin',
  heroDescription = 'Trusted digital twin intelligence for patients, doctors, and researchers with clinical-grade security.',
  stats = defaultStats,
}: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.76))]" />
      <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-200/15 blur-3xl" />
      <div className="absolute right-16 top-24 h-44 w-44 rounded-full bg-[#2455e8]/15 blur-2xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-100/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[46fr_54fr] lg:px-10 xl:px-16 2xl:px-20">
        <section className="hidden rounded-[2.5rem] border border-slate-200/80 bg-slate-950/95 p-8 text-white shadow-[0_32px_120px_rgba(15,23,42,0.18)] lg:grid lg:grid-rows-[auto_1fr_auto] lg:gap-8 lg:p-14">
          <div className="flex items-center justify-between gap-4">
            <Logo className="text-white" to="/" />
            <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold tracking-[0.12em] text-cyan-200 shadow-[0_10px_30px_rgba(10,102,153,0.12)]">
              Trusted healthcare AI
            </div>
          </div>
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="font-semibold uppercase tracking-[0.3em] text-cyan-300">Premium health intelligence</p>
              <h1 className="max-w-2xl text-[clamp(2.75rem,4vw,4.5rem)] leading-[0.95] font-black tracking-[-0.04em] text-white">
                {heroTitle}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
                {heroDescription}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-4xl font-extrabold text-cyan-300">97%</p>
                <p className="mt-3 text-sm text-slate-300">AI recommendation trust score</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-4xl font-extrabold text-cyan-300">HIPAA</p>
                <p className="mt-3 text-sm text-slate-300">Secure care data handling</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            {stats.map((stat) => (
              <div key={stat.value} className="space-y-1">
                <p className="text-2xl font-extrabold text-cyan-100">{stat.value}</p>
                <p className="text-sm text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="relative w-full max-w-[620px] rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-[0_32px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="absolute inset-x-10 top-0 hidden h-20 rounded-full bg-gradient-to-r from-cyan-300/20 via-sky-200/15 to-[#2455e8]/15 blur-3xl lg:block" />
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-cyan-300/10 blur-2xl" />
            <div className="absolute left-6 bottom-10 h-24 w-24 rounded-full bg-[#2455e8]/10 blur-2xl" />
            <div className="relative">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link className="inline-flex items-center gap-3 rounded-full border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-900" to="/">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/10 text-cyan-300">GT</span>
                  <span>GlucoTwin</span>
                </Link>
                <div className="rounded-full border border-slate-700 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 shadow-sm">
                  Premium healthcare SaaS
                </div>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
