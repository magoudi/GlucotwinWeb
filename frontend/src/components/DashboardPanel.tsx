import { type ReactNode } from 'react'

type DashboardPanelProps = {
  children: ReactNode
  className?: string
}

export function DashboardPanel({ children, className = '' }: DashboardPanelProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl xl:p-7 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative">{children}</div>
    </section>
  )
}
