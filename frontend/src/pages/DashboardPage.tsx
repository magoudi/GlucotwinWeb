import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppMetricCard } from '../components/AppMetricCard'
import { AppPageHeader } from '../components/AppPageHeader'
import { ApiStatePanel } from '../components/ApiStatePanel'
import { DashboardPanel } from '../components/DashboardPanel'
import { ExplainabilityPanel } from '../components/ExplainabilityPanel'
import { MiniLineChart, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { fetchPendingTreatmentPlan, dismissTreatmentPlan, acceptTreatmentPlan, type TreatmentPlan, type TimelineData, useAccount } from '../lib/api'
import { useApiData } from '../lib/api'
import { type PatientSummary } from '../lib/patientApi'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000'

// Extend PatientSummary to include the mock fields merged by the backend
type DashboardApiData = PatientSummary & {
  predictions: Array<{ label: string; value: number }>
  latestSafetyStatus: string
  recentSummaries: Array<{ label: string; value: string; detail: string }>
  explainability: { confidence: string; summary: string; drivers: Array<{ label: string; detail: string }> }
  glucoseForecast: Array<{ label: string; value: number }>
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, error } = useApiData<DashboardApiData>('/patient/summary')
  const timelineState = useApiData<TimelineData>('/patient/timeline')
  const [pendingPlan, setPendingPlan] = useState<TreatmentPlan | null>(null)
  const [patientComment, setPatientComment] = useState('')

  const user = useAccount()

  useEffect(() => {
    fetchPendingTreatmentPlan().then(res => {
      if (res.plan) setPendingPlan(res.plan)
    }).catch(console.error)

    if (user?.id) {
      const socket = io(SOCKET_URL, { withCredentials: true })
      
      socket.on('new_treatment_plan', (plan: TreatmentPlan) => {
        setPendingPlan(plan)
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [user?.id])

  const handleDismissPlan = async () => {
    if (!pendingPlan) return
    try {
      await dismissTreatmentPlan(pendingPlan.id, patientComment)
      setPendingPlan(null)
      setPatientComment('')
    } catch (e) {
      console.error(e)
    }
  }

  const handleAcceptPlan = async () => {
    if (!pendingPlan) return
    try {
      await acceptTreatmentPlan(pendingPlan.id, patientComment)
      setPendingPlan(null)
      setPatientComment('')
    } catch (e) {
      console.error(e)
    }
  }

  if (!data) {
    return <AppLayout><ApiStatePanel error={error} /></AppLayout>
  }

  return (
    <AppLayout>
      <AppPageHeader
        title="Today's Overview"
        description="Clinical status, daily predictions, and recommended actions."
        action="Log Event"
        onAction={() => navigate('/timeline')}
      />

      {/* 1. What needs attention now? */}
      {pendingPlan && (
        <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 shadow-[0_8px_30px_rgba(34,211,238,0.2)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg">
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">New Treatment Plan Recommended</h3>
                <p className="mt-1 text-sm font-bold text-cyan-200">{pendingPlan.description}</p>
                {pendingPlan.clinicianReply && (
                  <p className="mt-2 text-sm text-cyan-50">Clinician reply: {pendingPlan.clinicianReply}</p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1120]/40 px-4 py-3 text-right text-sm text-slate-300">
              <div className="font-bold text-white">Opened</div>
              <div>{new Date(pendingPlan.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <textarea
            value={patientComment}
            onChange={(event) => setPatientComment(event.target.value)}
            placeholder="Optional note to your care team about this plan."
            className="mt-4 min-h-[80px] w-full rounded-xl border border-white/10 bg-[#0B1120]/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
          />
          <div className="mt-4 flex gap-3">
            <button onClick={handleDismissPlan} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
              Dismiss
            </button>
            <button onClick={handleAcceptPlan} className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-sm font-extrabold text-[#0B1120] transition-colors shadow-lg">
              Apply Update
            </button>
          </div>
        </div>
      )}

      {/* 2. Current State & Risk Predicted */}
      <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        <AppMetricCard label="Current glucose" value={`${data.currentGlucose} ${user?.glucoseUnit || 'mg/dL'}`} detail="Updated 2m ago" />
        {data.predictions.map((prediction) => (
          <AppMetricCard key={prediction.label} label={`${prediction.label} forecast`} value={`${prediction.value} ${user?.glucoseUnit || 'mg/dL'}`} detail="AI Prediction" />
        ))}
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.35fr_0.85fr]">
        <DashboardPanel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="text-[24px] font-extrabold text-white">Predicted Glucose Trend</h2>
            <StatusBadge status={data.latestSafetyStatus} />
          </div>
          <p className="mt-2 text-[16px] text-slate-300">Continuous 4-hour forecast based on recent events and basal profile.</p>
          <MiniLineChart data={data.glucoseForecast} height="mt-6 h-[280px]" />
          <div className="mt-6">
            <ExplainabilityPanel
              title="Why the forecast looks this way"
              confidence={data.explainability.confidence}
              summary={data.explainability.summary}
              drivers={data.explainability.drivers}
            />
          </div>
        </DashboardPanel>

        {/* 3. What changed recently? */}
        <DashboardPanel>
          <h2 className="text-[24px] font-extrabold text-white">Recent Context</h2>
          <p className="mt-2 text-[16px] text-slate-300">Events driving your current predictions.</p>
          <div className="mt-6 grid gap-4">
            {data.recentSummaries.map((summary) => (
              <div key={summary.label} className="rounded-lg border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-colors hover:bg-white/10">
                <p className="text-[15px] font-bold uppercase tracking-wider text-slate-400">{summary.label}</p>
                <p className="mt-1 text-[22px] font-extrabold text-white">{summary.value}</p>
                <p className="mt-1 text-[14px] text-slate-300">{summary.detail}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <DashboardPanel>
          <h2 className="text-[24px] font-extrabold text-white">Next Best Actions</h2>
          <p className="mt-2 text-[15px] text-slate-300">The fastest ways to reduce uncertainty before your next major glucose decision.</p>
          <div className="mt-5 grid gap-3">
            {[
              ['Review treatment plan', pendingPlan ? 'A new clinician recommendation is ready for your response.' : 'No pending treatment plan right now.', '/care-team'],
              ['Log your next event', 'Keep meals, insulin, and activity current so the digital twin stays calibrated.', '/timeline'],
              ['Run a what-if check', 'Use the simulator if you are deciding between meal size or activity options.', '/what-if-simulator'],
            ].map(([label, detail, path]) => (
              <button key={label} type="button" onClick={() => navigate(path)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-colors hover:bg-white/10">
                <p className="text-sm font-extrabold text-white">{label}</p>
                <p className="mt-1 text-sm text-slate-400">{detail}</p>
              </button>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-extrabold text-white">Timeline Preview</h2>
              <p className="mt-2 text-[15px] text-slate-300">Recent events now feed directly into your prediction context.</p>
            </div>
            <button type="button" onClick={() => navigate('/timeline')} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-white/10">
              View full timeline
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {timelineState.data?.events.slice(0, 3).map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">{event.type}</p>
                    <p className="mt-1 text-sm font-extrabold text-white">{event.title}</p>
                    <p className="mt-2 text-sm text-slate-400">{event.impact}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-500">{event.timestampLabel}</p>
                </div>
              </div>
            )) ?? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-slate-400">
                Timeline data is loading.
              </div>
            )}
          </div>
        </DashboardPanel>
      </div>

      {/* 4. What should the user do next? */}
      <div className="mt-6">
        <h2 className="mb-4 text-[20px] font-extrabold text-white">Clinical Decisions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Bolus Prediction', '/bolus-prediction', 'Calculate optimal meal dose'],
            ['Basal Schedule', '/basal-schedule', 'Review overnight patterns'],
            ['Food Portion', '/food-portion', 'Check meal impact'],
            ['What-If Simulator', '/what-if-simulator', 'Test scenarios safely'],
          ].map(([label, path, description]) => (
            <button key={label} className="group rounded-xl border border-white/10 bg-white/5 p-5 text-left transition-all hover:border-[#25c2a0]/50 hover:bg-white/10" type="button" onClick={() => navigate(path)}>
              <h3 className="text-[18px] font-extrabold text-white group-hover:text-[#25c2a0] transition-colors">{label}</h3>
              <p className="mt-2 text-[14px] text-slate-400">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
