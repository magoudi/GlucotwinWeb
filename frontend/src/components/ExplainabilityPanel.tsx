type ExplainabilityPanelProps = {
  title: string
  confidence: string
  summary: string
  drivers: Array<{ label: string; detail: string }>
}

export function ExplainabilityPanel({ title, confidence, summary, drivers }: ExplainabilityPanelProps) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.08] p-5 shadow-[0_14px_36px_rgba(34,211,238,0.1)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">Explainability</p>
          <h3 className="mt-2 text-xl font-extrabold text-white">{title}</h3>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0B1120]/50 px-4 py-2 text-right">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Confidence</p>
          <p className="text-lg font-extrabold text-cyan-300">{confidence}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-200">{summary}</p>
      <div className="mt-5 grid gap-3">
        {drivers.map((driver) => (
          <div key={driver.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{driver.label}</p>
            <p className="mt-1 text-sm font-bold text-white">{driver.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
