import { AppMetricCard } from '../components/AppMetricCard'
import { AppPageHeader } from '../components/AppPageHeader'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { DashboardPanel } from '../components/DashboardPanel'
import { ProgressBar, PrototypeNotice, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { useApiData } from '../lib/api'

export function AdaptationPage() {
  const { data, error } = useApiData<ReturnType<typeof import('../services/mockGlucoTwinService').getAdaptationStatus>>('/glucotwin/adaptation')

  if (!data) {
    return <AppLayout><ApiStatePanel error={error} /></AppLayout>
  }

  return (
    <AppLayout>
      <AppPageHeader title="Adaptation phase" description="Fourteen days of fake patient data personalize the physiological model before active simulation." />
      <PrototypeNotice>{data.disclaimer}</PrototypeNotice>

      <DashboardPanel>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="text-[26px] font-extrabold text-slate-900">{data.daysCompleted} of {data.daysTotal} days completed</h2>
            <p className="mt-1.5 text-[15px] font-semibold text-[#2455e8]">{data.personalizationStatus}</p>
          </div>
          <StatusBadge status="Adaptation" />
        </div>
        <div className="mt-6">
          <ProgressBar value={data.progress} />
          <p className="mt-2.5 text-[14px] font-bold text-slate-500">{data.progress}% adaptation progress</p>
        </div>
      </DashboardPanel>

      <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-5">
        {data.collectedData.map((item) => <AppMetricCard key={item.label} label={item.label} value={item.value} detail={item.detail} />)}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.8fr_1.3fr]">
        <DashboardPanel>
          <h2 className="text-[26px] font-extrabold text-slate-900">Missing data warnings</h2>
          <div className="mt-6 space-y-4">
            {data.warnings.map((warning) => (
              <div key={warning} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[15px] font-semibold text-amber-800">{warning}</div>
            ))}
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <h2 className="text-[26px] font-extrabold text-slate-900">Data timeline</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
              <thead className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                <tr><th className="pb-2 pl-4">Day</th><th className="pb-2">CGM</th><th className="pb-2">Insulin</th><th className="pb-2">Meals</th><th className="pb-2">Activity</th><th className="pb-2">Sleep</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody>
                {data.timeline.map((day) => (
                  <tr key={day.day} className="bg-slate-50/50 border border-slate-100 rounded-xl text-[14px] font-medium text-slate-700 transition-colors hover:bg-slate-100/60">
                    <td className="rounded-l-xl px-4 py-3 font-extrabold text-slate-900">Day {day.day}</td>
                    <td className="py-3">{day.glucose} readings</td>
                    <td className="py-3">{day.insulin} events</td>
                    <td className="py-3">{day.meals}</td>
                    <td className="py-3">{day.activity} min</td>
                    <td className="py-3">{day.sleep} h</td>
                    <td className="rounded-r-xl pr-4 py-3"><StatusBadge status={day.status === 'Complete' ? 'Safe' : 'Caution'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardPanel>
      </div>

    </AppLayout>
  )
}
