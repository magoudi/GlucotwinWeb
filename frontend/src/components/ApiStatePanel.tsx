import { DashboardPanel } from './DashboardPanel'

type ApiStatePanelProps = {
  error?: string | null
}

export function ApiStatePanel({ error }: ApiStatePanelProps) {
  return (
    <DashboardPanel>
      <p className="text-[22px] font-extrabold text-[#102326]">{error ? 'Could not load data' : 'Loading data...'}</p>
      {error && <p className="mt-3 text-[18px] text-[#667d83]">{error}</p>}
    </DashboardPanel>
  )
}
