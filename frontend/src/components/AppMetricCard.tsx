type AppMetricCardProps = {
  label: string
  value: string
  detail: string
  accentClassName?: string
}

export function AppMetricCard({ label, value, detail, accentClassName = 'from-cyan-400 to-emerald-400' }: AppMetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-5 shadow-[0_14px_34px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_20px_40px_rgba(37,194,160,0.15)] xl:p-7">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <p className="text-base font-extrabold text-slate-400 xl:text-[17px]">{label}</p>
        <p className={`mt-3 text-[clamp(2rem,3vw,2.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-r xl:mt-5 ${accentClassName}`}>{value}</p>
        <p className="mt-2 text-base font-semibold leading-6 text-slate-300 xl:text-[18px]">{detail}</p>
      </div>
    </div>
  )
}
