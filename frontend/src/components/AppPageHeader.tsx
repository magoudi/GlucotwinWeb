type AppPageHeaderProps = {
  title: string
  description: string
  action?: string
  mutedAction?: boolean
  onAction?: () => void
}

export function AppPageHeader({ title, description, action, mutedAction = false, onAction }: AppPageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]/40 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-3xl sm:px-7 xl:px-8 xl:py-7">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#25c2a0] via-[#8edfd1] to-[#2f6fee]" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-4xl">
          <div className="mb-4 inline-flex rounded-full border border-[#25c2a0]/30 bg-[#25c2a0]/10 px-3 py-1.5 text-sm font-extrabold text-[#25c2a0]">
            GlucoTwin prototype
          </div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{title}</h1>
          <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-300 xl:leading-8">{description}</p>
        </div>
        {action && (
          <button
            className={`rounded-2xl px-5 py-3 text-base font-extrabold shadow-[0_12px_26px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:shadow-[0_12px_30px_rgba(37,194,160,0.3)] xl:px-7 xl:py-4 xl:text-[18px] ${
              mutedAction ? 'bg-white/10 text-white border border-white/20 hover:bg-white/15' : 'bg-gradient-to-r from-[#25c2a0] to-[#21a88b] text-[#0B1120] border border-transparent'
            }`}
            type="button"
            onClick={onAction}
          >
            {action}
          </button>
        )}
      </div>
    </header>
  )
}
