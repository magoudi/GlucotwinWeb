type AppPageHeaderProps = {
  title: string
  description: string
  action?: string
  mutedAction?: boolean
  onAction?: () => void
}

export function AppPageHeader({ title, description, action, mutedAction = false, onAction }: AppPageHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-black/8 bg-white px-5 py-5 shadow-[0_2px_12px_rgba(17,17,17,0.06)] sm:px-7 xl:px-8 xl:py-7">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2455e8] via-[#6b93ff] to-[#4f7bff]" />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-4xl">
          <div className="mb-3 inline-flex rounded-full border border-[#2455e8]/20 bg-[#e8eeff] px-3 py-1.5 text-sm font-extrabold text-[#2455e8]">
            GlucoTwin prototype
          </div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-[#111111]">{title}</h1>
          <p className="mt-3 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-medium text-[#555555] xl:leading-8">{description}</p>
        </div>
        {action && (
          <button
            className={`rounded-2xl px-5 py-3 text-base font-extrabold shadow-sm transition-all hover:scale-105 xl:px-7 xl:py-4 xl:text-[18px] ${
              mutedAction
                ? 'bg-[#f5f4f0] text-[#111111] border border-black/8 hover:bg-[#efebe5]'
                : 'bg-[#2455e8] text-gray-900 border border-transparent hover:bg-[#1a44cc] hover:shadow-[0_4px_18px_rgba(36,85,232,0.28)]'
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
