import { type ReactNode } from 'react'

type DashboardPanelProps = {
  children: ReactNode
  className?: string
}

export function DashboardPanel({ children, className = '' }: DashboardPanelProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-black/8 bg-white p-5 shadow-[0_2px_12px_rgba(17,17,17,0.06)] transition-shadow hover:shadow-[0_4px_20px_rgba(17,17,17,0.09)] xl:p-7 ${className}`}
    >
      <div className="relative">{children}</div>
    </section>
  )
}
