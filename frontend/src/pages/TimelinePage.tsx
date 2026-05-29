import { AppMetricCard } from '../components/AppMetricCard'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { DashboardPanel } from '../components/DashboardPanel'
import { type TimelineEvent, type TimelineData } from '../lib/api'
import { fetchPatientTimeline } from '../lib/patientApi'
import { PrototypeNotice, StatusBadge } from '../components/GlucoTwinUI'
import { useEffect, useState } from 'react'

/**
 * Build timeline events from saved inputs stored in localStorage.
 */
function getSavedInputEvents(): TimelineEvent[] {
  const events: TimelineEvent[] = []

  function addEvents(key: string, type: 'bolus' | 'food' | 'whatif', title: string, mapDetail: (d: any) => string, mapImpact: (d: any) => string, targetContext: string) {
    try {
      const saved = localStorage.getItem(key)
      if (!saved) return
      const parsed = JSON.parse(saved)
      const entries = Array.isArray(parsed) ? parsed : [parsed]
      
      entries.forEach((d, index) => {
        const savedAt = d.savedAt ? new Date(d.savedAt) : new Date()
        events.push({
          id: `saved-${type}-${index}-${savedAt.getTime()}`,
          type,
          title,
          detail: mapDetail(d),
          timestampLabel: savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Saved)',
          impact: mapImpact(d),
          severity: 'info',
          targetContext,
        })
      })
    } catch { /* ignore */ }
  }

  addEvents(
    'glucotwin_bolus_inputs',
    'bolus',
    'Saved Bolus Prediction Inputs',
    (d) => `Glucose: ${d.currentGlucose ?? '—'} mg/dL · Carbs: ${d.carbs ?? '—'}g · Protein: ${d.protein ?? '—'}g · Fat: ${d.fat ?? '—'}g`,
    (d) => `Meal: ${d.mealType ?? '—'} · Activity: ${d.activity ?? '—'} · IOB: ${d.insulinOnBoard ?? '—'} U`,
    'Bolus prediction'
  )

  addEvents(
    'glucotwin_food_inputs',
    'food',
    'Saved Food Portion Inputs',
    (d) => `Food: ${d.food ?? '—'} · Glucose: ${d.currentGlucose ?? '—'} mg/dL`,
    (d) => `Meal: ${d.mealType ?? '—'} · Context: ${d.context ?? '—'}`,
    'Food recommendation'
  )

  addEvents(
    'glucotwin_whatif_inputs',
    'whatif',
    'Saved What-If Scenario Inputs',
    (d) => `Food: ${d.foodAmount ?? '—'}g · Carbs: ${d.carbs ?? '—'}g · Protein: ${d.protein ?? '—'}g · Fat: ${d.fat ?? '—'}g`,
    (d) => `Bolus: ${d.bolusDose ?? '—'} U · Basal Δ: ${d.basalChange ?? 0}% · Activity: ${d.activity ?? '—'}`,
    'What-if simulation'
  )

  return events
}

const TYPE_COLORS: Record<string, string> = {
  meal: 'text-cyan-800 bg-cyan-50 border border-cyan-150',
  insulin: 'text-violet-800 bg-violet-50 border border-violet-150',
  activity: 'text-emerald-800 bg-emerald-50 border border-emerald-150',
  sleep: 'text-indigo-800 bg-indigo-50 border border-indigo-150',
  plan: 'text-amber-800 bg-amber-50 border border-amber-150',
  bolus: 'text-rose-800 bg-rose-50 border border-rose-150',
  food: 'text-emerald-850 bg-emerald-50 border border-emerald-150',
  whatif: 'text-orange-850 bg-orange-50 border border-orange-150',
}

const TYPE_BORDERS: Record<string, string> = {
  bolus: 'border-rose-100 bg-rose-50/30',
  food: 'border-emerald-100 bg-emerald-50/30',
  whatif: 'border-orange-100 bg-orange-50/30',
}

export function TimelinePage() {
  const [data, setData] = useState<TimelineData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatientTimeline()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load timeline'))
  }, [])

  if (!data) {
    return (
      <AppLayout>
        <ApiStatePanel error={error} />
      </AppLayout>
    )
  }

  const savedEvents = getSavedInputEvents()
  const allEvents = [...savedEvents, ...data.events]

  const toneBySeverity = {
    info: 'Active',
    safe: 'Safe',
    warning: 'Caution',
  } as const

  return (
    <AppLayout>
      <AppPageHeader
        title="Event Timeline"
        description="A unified chronological view of meals, insulin, activity, sleep, and saved inputs."
      />
      <PrototypeNotice>{data.disclaimer}</PrototypeNotice>
      <div className="grid gap-5 sm:grid-cols-4">
        <AppMetricCard label="Meals logged" value={String(data.summary.meals)} detail="Today" />
        <AppMetricCard label="Insulin events" value={String(data.summary.insulinEvents)} detail="Basal + bolus" />
        <AppMetricCard label="Activity minutes" value={String(data.summary.activityMinutes)} detail="Movement context" />
        <AppMetricCard label="Sleep" value={`${data.summary.sleepHours} h`} detail="Overnight data" />
      </div>

      {/* Daily Event Stream — includes saved inputs */}
      <DashboardPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold text-slate-900">Daily Event Stream</h2>
            <p className="mt-2 text-[15px] text-slate-500">A timeline view that connects logged events to prediction context and care-team workflows.</p>
          </div>
          <StatusBadge status="Prototype" />
        </div>
        <div className="mt-6 space-y-4">
          {allEvents.map((event) => (
            <div key={event.id} className={`rounded-xl border p-5 transition-all hover:shadow-sm ${TYPE_BORDERS[event.type] || 'border-slate-200 bg-slate-50/20'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md ${TYPE_COLORS[event.type] || 'text-cyan-800 bg-cyan-50'}`}>{event.type}</span>
                    <p className="text-xs font-bold text-slate-500">{event.timestampLabel}</p>
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold text-slate-900">{event.title}</h3>
                  <p className="mt-1.5 text-sm font-semibold text-slate-600 leading-6">{event.detail}</p>
                  <p className="mt-2 text-sm text-slate-500">{event.impact}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={toneBySeverity[event.severity]} />
                  <p className="mt-3 text-xs font-bold text-slate-500">{event.targetContext}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </AppLayout>
  )
}

