import { AppPageHeader } from '../components/AppPageHeader'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { DashboardPanel } from '../components/DashboardPanel'
import { PrototypeNotice, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { useApiData } from '../lib/api'

export function AIModelsPage() {
  const { data, error } = useApiData<ReturnType<typeof import('../services/mockGlucoTwinService').getAiModelsStatus>>('/glucotwin/models')

  if (!data) {
    return <AppLayout><ApiStatePanel error={error} /></AppLayout>
  }

  return (
    <AppLayout>
      <AppPageHeader title="AI models" description="Model cards showing how AI outputs would be checked by the physiological model." />
      <PrototypeNotice>{data.disclaimer}</PrototypeNotice>
      <div className="grid gap-6 xl:grid-cols-3">
        {data.models.map((model) => (
          <DashboardPanel key={model.name}>
            <div className="flex min-h-[92px] flex-col justify-between gap-4">
              <h2 className="text-[28px] font-extrabold leading-tight text-white">{model.name}</h2>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={model.phase} />
                <StatusBadge status={model.status} />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[18px] font-extrabold text-white">Inputs used</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {model.inputs.map((input) => <span key={input} className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-slate-300">{input}</span>)}
              </div>
            </div>
            <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <p className="text-sm font-extrabold uppercase text-slate-400">Prediction output</p>
              <p className="mt-2 text-[22px] font-extrabold text-white">{model.output}</p>
            </div>
            <div className="mt-5 rounded-lg border border-white/10 p-4">
              <StatusBadge status={model.safety.status} />
              <p className="mt-3 text-[18px] font-extrabold text-white">{model.safety.label}</p>
              <p className="mt-2 text-[16px] leading-6 text-slate-300">{model.safety.message}</p>
            </div>
            <p className="mt-5 text-[17px] font-bold leading-7 text-slate-300">{model.feedback}</p>
          </DashboardPanel>
        ))}
      </div>
    </AppLayout>
  )
}
