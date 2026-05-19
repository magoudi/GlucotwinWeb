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
  meal: 'text-cyan-300',
  insulin: 'text-violet-300',
  activity: 'text-emerald-300',
  sleep: 'text-indigo-300',
  plan: 'text-amber-300',
  bolus: 'text-rose-300',
  food: 'text-lime-300',
  whatif: 'text-orange-300',
}

const TYPE_BORDERS: Record<string, string> = {
  bolus: 'border-rose-500/20 bg-rose-500/[0.03]',
  food: 'border-lime-500/20 bg-lime-500/[0.03]',
  whatif: 'border-orange-500/20 bg-orange-500/[0.03]',
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
            <h2 className="text-[26px] font-extrabold text-white">Daily Event Stream</h2>
            <p className="mt-2 text-[15px] text-slate-300">A timeline view that connects logged events to prediction context and care-team workflows.</p>
          </div>
          <StatusBadge status="Prototype" />
        </div>
        <div className="mt-6 space-y-4">
          {allEvents.map((event) => (
            <div key={event.id} className={`rounded-2xl border p-5 ${TYPE_BORDERS[event.type] || 'border-white/10 bg-white/5'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className={`text-xs font-extrabold uppercase tracking-wider ${TYPE_COLORS[event.type] || 'text-cyan-300'}`}>{event.type}</p>
                    <p className="text-xs font-bold text-slate-500">{event.timestampLabel}</p>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold text-white">{event.title}</h3>
                  <p className="mt-2 text-sm font-bold text-slate-300">{event.detail}</p>
                  <p className="mt-3 text-sm text-slate-400">{event.impact}</p>
                </div>
                <div className="text-right">
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
