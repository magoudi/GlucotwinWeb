import { useEffect, useState } from 'react'
import { AppPageHeader } from '../components/AppPageHeader'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { DashboardPanel } from '../components/DashboardPanel'
import { MiniLineChart, PrototypeNotice, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { generateBasalScheduleMock } from '../services/mockGlucoTwinService'
import { generateBasalApi } from '../services/api'

export function BasalPlanPage() {
  const [data, setData] = useState<ReturnType<typeof generateBasalScheduleMock> | null>(null)
  const [version, setVersion] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    generateBasalApi<ReturnType<typeof generateBasalScheduleMock>>()
      .then(setData)
      .catch((apiError) => setError(apiError instanceof Error ? apiError.message : 'Could not load basal schedule'))
  }, [])

  function regenerate() {
    setSavedMsg('')
    generateBasalApi<ReturnType<typeof generateBasalScheduleMock>>()
      .then((nextData) => {
        setData(nextData)
        setVersion((current) => current + 1)
        setSavedMsg('New schedule saved to timeline.')
      })
      .catch((apiError) => setError(apiError instanceof Error ? apiError.message : 'Could not regenerate schedule'))
  }

  if (!data) {
    return <AppLayout><ApiStatePanel error={error} /></AppLayout>
  }

  return (
    <AppLayout>
      <AppPageHeader title="Basal schedule" description="24-hour basal schedule with simulated glucose response and physiological safety review." action="Regenerate schedule" onAction={regenerate} />
      <PrototypeNotice>{data.note}</PrototypeNotice>
      <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.85fr]">
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">24-hour basal schedule</h2>
          <p className="mt-2 text-[16px] font-bold text-slate-400">Prototype version {version}. Values are simulation-only U/h blocks.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {data.schedule.map((block) => (
              <div key={block.time} className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[16px] font-bold text-slate-400">{block.time}</p>
                <p className="mt-2 text-[32px] font-extrabold text-white">{block.rate.toFixed(2)} U/h</p>
                <p className="mt-2 text-[16px] text-slate-300">Predicted response {block.response} mg/dL</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Physiological check</h2>
          <div className="mt-6 rounded-lg border border-white/10 p-5">
            <StatusBadge status={data.safety.status} />
            <p className="mt-4 text-[22px] font-extrabold text-white">{data.safety.label}</p>
            <p className="mt-2 text-[17px] leading-7 text-slate-300">{data.safety.message}</p>
          </div>
          <p className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-[17px] font-bold leading-7 text-rose-300 backdrop-blur-sm">
            Warning: prototype data only. Not medical advice and not connected to a real pump.
          </p>
          {savedMsg && <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-[17px] font-bold text-emerald-400">{savedMsg}</p>}
        </DashboardPanel>
      </div>
      <DashboardPanel>
        <h2 className="text-[30px] font-extrabold text-white">Predicted glucose response</h2>
        <MiniLineChart data={data.predictedResponse} height="mt-6 h-[320px]" />
      </DashboardPanel>
    </AppLayout>
  )
}
