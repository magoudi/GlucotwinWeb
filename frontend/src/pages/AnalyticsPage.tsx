import { AppMetricCard } from '../components/AppMetricCard'
import { AppPageHeader } from '../components/AppPageHeader'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { DashboardPanel } from '../components/DashboardPanel'
import { ExplainabilityPanel } from '../components/ExplainabilityPanel'
import { BarChart, MiniLineChart, PrototypeNotice } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { useApiData } from '../lib/api'

export function AnalyticsPage() {
  const { data, error } = useApiData<any>('/patient/analytics')

  if (!data) {
    return <AppLayout><ApiStatePanel error={error} /></AppLayout>
  }

  return (
    <AppLayout>
      <AppPageHeader title="Analytics" description="Prototype charts for glucose, meals, insulin, basal patterns, activity, and sleep impact." />
      <PrototypeNotice>{data.disclaimer}</PrototypeNotice>
      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Glucose trends</h2>
          <MiniLineChart data={data.glucoseTrends} height="mt-6 h-[300px]" />
        </DashboardPanel>
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Time in range</h2>
          <BarChart data={data.timeInRange} suffix="%" height="mt-6 h-[300px]" />
        </DashboardPanel>
      </div>
      <ExplainabilityPanel
        title="What the trend panels are trying to tell you"
        confidence="Prototype"
        summary="These analytics are still based on data, but the biggest drivers are meant to stay interpretable: meal timing, total insulin exposure, activity dose, and sleep quality."
        drivers={[
          { label: 'Meals', detail: 'Dinner and larger mixed meals are still the biggest source of high-glucose excursions.' },
          { label: 'Activity', detail: 'Higher movement blocks reduce the average peak later in the day.' },
          { label: 'Sleep', detail: 'Poorer sleep is associated with higher next-day glucose volatility in this prototype model.' },
        ]}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        {data.events.map((event: { label: string; value: string; detail: string }) => <AppMetricCard key={event.label} label={event.label} value={event.value} detail={event.detail} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <DashboardPanel><h2 className="text-[26px] font-extrabold text-white">Meal impact</h2><BarChart data={data.mealImpact} suffix=" mg/dL" height="mt-5 h-[240px]" /></DashboardPanel>
        <DashboardPanel><h2 className="text-[26px] font-extrabold text-white">Bolus history</h2><BarChart data={data.bolusHistory} suffix=" U" height="mt-5 h-[240px]" /></DashboardPanel>
        <DashboardPanel><h2 className="text-[26px] font-extrabold text-white">Basal history</h2><BarChart data={data.basalHistory} suffix=" U/h" height="mt-5 h-[240px]" /></DashboardPanel>
        <DashboardPanel><h2 className="text-[26px] font-extrabold text-white">Activity effect</h2><BarChart data={data.activityEffect} suffix=" mg/dL" height="mt-5 h-[240px]" /></DashboardPanel>
        <DashboardPanel><h2 className="text-[26px] font-extrabold text-white">Sleep effect</h2><BarChart data={data.sleepEffect} suffix=" mg/dL" height="mt-5 h-[240px]" /></DashboardPanel>
      </div>
    </AppLayout>
  )
}
