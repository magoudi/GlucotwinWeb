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
            <h2 className="text-[30px] font-extrabold text-white">{data.daysCompleted} of {data.daysTotal} days completed</h2>
            <p className="mt-3 text-[18px] font-bold text-slate-300">{data.personalizationStatus}</p>
          </div>
          <StatusBadge status="Adaptation" />
        </div>
        <div className="mt-6">
          <ProgressBar value={data.progress} />
          <p className="mt-3 text-[16px] font-bold text-slate-400">{data.progress}% adaptation progress</p>
        </div>
      </DashboardPanel>

      <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-5">
        {data.collectedData.map((item) => <AppMetricCard key={item.label} label={item.label} value={item.value} detail={item.detail} />)}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.8fr_1.3fr]">
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Missing data warnings</h2>
          <div className="mt-6 space-y-4">
            {data.warnings.map((warning) => (
              <div key={warning} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-[18px] font-bold text-amber-200 backdrop-blur-sm">{warning}</div>
            ))}
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Data timeline</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-3 text-left">
              <thead className="text-sm font-extrabold uppercase text-slate-400">
                <tr><th>Day</th><th>CGM</th><th>Insulin</th><th>Meals</th><th>Activity</th><th>Sleep</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.timeline.map((day) => (
                  <tr key={day.day} className="bg-white/5 text-[17px] font-medium text-slate-300 transition-colors hover:bg-white/10">
                    <td className="rounded-l-lg px-4 py-4 font-bold text-white">Day {day.day}</td>
                    <td>{day.glucose} readings</td>
                    <td>{day.insulin} events</td>
                    <td>{day.meals}</td>
                    <td>{day.activity} min</td>
                    <td>{day.sleep} h</td>
                    <td className="rounded-r-lg pr-4"><StatusBadge status={day.status === 'Complete' ? 'Safe' : 'Caution'} /></td>
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
