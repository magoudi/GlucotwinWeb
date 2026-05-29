type ExplainabilityPanelProps = {
  title: string
  confidence: string
  summary: string
  drivers: Array<{ label: string; detail: string }>
}

export function ExplainabilityPanel({ title, confidence, summary, drivers }: ExplainabilityPanelProps) {
  return (
    <div className="rounded-2xl border border-[#2455e8]/20 bg-[#e8eeff] p-5 shadow-[0_4px_16px_rgba(36,85,232,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#2455e8]">Explainability</p>
          <h3 className="mt-2 text-xl font-extrabold text-[#111111]">{title}</h3>
        </div>
        <div className="rounded-xl border border-black/8 bg-white px-4 py-2 text-right">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#666666]">Confidence</p>
          <p className="text-lg font-extrabold text-[#2455e8]">{confidence}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#111111]">{summary}</p>
      <div className="mt-5 grid gap-3">
        {drivers.map((driver) => (
          <div key={driver.label} className="rounded-xl border border-black/8 bg-white px-4 py-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#666666]">{driver.label}</p>
            <p className="mt-1 text-sm font-bold text-[#111111]">{driver.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
