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
          <h2 className="text-[26px] font-extrabold text-slate-900">24-hour basal schedule</h2>
          <p className="mt-2 text-[15px] font-medium text-slate-500">Prototype version {version}. Values are simulation-only U/h blocks.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {data.schedule.map((block) => (
              <div key={block.time} className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
                <p className="text-[14px] font-bold text-slate-500">{block.time}</p>
                <p className="mt-1.5 text-[28px] font-extrabold text-slate-900">{block.rate.toFixed(2)} U/h</p>
                <p className="mt-2 text-[14px] font-medium text-slate-600">Predicted response: <span className="font-extrabold text-[#2455e8]">{block.response} mg/dL</span></p>
              </div>
            ))}
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <h2 className="text-[26px] font-extrabold text-slate-900">Physiological check</h2>
          <div className="mt-6 rounded-xl border border-slate-200 p-5 bg-slate-50/40">
            <StatusBadge status={data.safety.status} />
            <p className="mt-4 text-[20px] font-extrabold text-slate-900">{data.safety.label}</p>
            <p className="mt-2 text-[15px] leading-6 text-slate-600">{data.safety.message}</p>
          </div>
          <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-[14px] font-semibold leading-6 text-rose-800">
            Warning: Prototype data only. Not medical advice and not connected to a real pump.
          </p>
          {savedMsg && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[14px] font-semibold text-emerald-800">{savedMsg}</p>}
        </DashboardPanel>
      </div>
      <DashboardPanel>
        <h2 className="text-[26px] font-extrabold text-slate-900">Predicted glucose response</h2>
        <MiniLineChart data={data.predictedResponse} height="mt-6 h-[320px]" />
      </DashboardPanel>
    </AppLayout>
  )
}

