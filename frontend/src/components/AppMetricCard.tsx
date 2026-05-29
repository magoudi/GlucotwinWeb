type AppMetricCardProps = {
  label: string
  value: string
  detail: string
  accentClassName?: string
}

export function AppMetricCard({ label, value, detail, accentClassName = 'from-[#2455e8] to-[#4f7bff]' }: AppMetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/8 bg-white p-5 shadow-[0_2px_12px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2455e8]/20 hover:shadow-[0_8px_28px_rgba(36,85,232,0.12)] xl:p-7">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#e8eeff]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <p className="text-base font-semibold text-[#888888] xl:text-[17px]">{label}</p>
        <p className={`mt-3 text-[clamp(2rem,3vw,2.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-r xl:mt-5 ${accentClassName}`}>{value}</p>
        <p className="mt-2 text-base font-medium leading-6 text-[#555555] xl:text-[17px]">{detail}</p>
      </div>
    </div>
  )
}
