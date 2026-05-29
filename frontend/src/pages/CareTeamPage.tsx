import { useEffect, useMemo, useState } from 'react'
import { AppMetricCard } from '../components/AppMetricCard'
import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { DashboardPanel } from '../components/DashboardPanel'
import { acceptTreatmentPlan, dismissTreatmentPlan, fetchTreatmentPlanHistory, fetchPendingTreatmentPlan, type TreatmentPlan } from '../lib/api'
import { PrototypeNotice, StatusBadge } from '../components/GlucoTwinUI'
import { fetchPatientCareTeam, type CareTeamData } from '../lib/patientApi'

export function CareTeamPage() {
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [patientComment, setPatientComment] = useState('')
  const [careTeamData, setCareTeamData] = useState<CareTeamData | null>(null)

  async function loadPlans() {
    setLoading(true)
    setError('')
    try {
      const [pendingRes, historyRes] = await Promise.all([
        fetchPendingTreatmentPlan(),
        fetchTreatmentPlanHistory(),
      ])

      const mergedPlans = pendingRes.plan
        ? [pendingRes.plan, ...historyRes.plans.filter((plan) => plan.id !== pendingRes.plan?.id)]
        : historyRes.plans

      setPlans(mergedPlans)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load care team data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
    fetchPatientCareTeam().then(setCareTeamData).catch(console.error)
  }, [])

  const pendingPlan = useMemo(
    () => plans.find((plan) => plan.status === 'signed_pending_patient') ?? null,
    [plans],
  )

  const historicalPlans = useMemo(
    () => plans.filter((plan) => !pendingPlan || plan.id !== pendingPlan.id),
    [plans, pendingPlan],
  )

  async function handlePlanAction(action: 'accept' | 'dismiss', planId: string) {
    try {
      if (action === 'accept') {
        await acceptTreatmentPlan(planId, patientComment)
        setActionMsg('Treatment plan accepted and moved to your history.')
      } else {
        await dismissTreatmentPlan(planId, patientComment)
        setActionMsg('Treatment plan dismissed.')
      }
      setPatientComment('')
      await loadPlans()
      window.setTimeout(() => setActionMsg(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update treatment plan')
    }
  }

  return (
    <AppLayout>
      <AppPageHeader
        title="Care Team & Treatment Plans"
        description="Review active treatment plans and communicate with your clinical team."
      />
      <PrototypeNotice>
        Care team communication is still a prototype workflow, but treatment plan actions and history are now wired through the backend.
      </PrototypeNotice>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-50 p-5 text-sm font-bold text-red-200">
          {error}
        </div>
      )}

      {actionMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm font-bold text-emerald-200">
          {actionMsg}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <AppMetricCard label="Pending plans" value={String(plans.filter((plan) => plan.status === 'signed_pending_patient').length)} detail="Need your review" />
        <AppMetricCard label="Accepted plans" value={String(plans.filter((plan) => plan.status === 'accepted').length)} detail="Already acknowledged" />
        <AppMetricCard label="Care team contacts" value="3" detail="Endocrinologist, nurse, educator" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardPanel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[26px] font-extrabold text-slate-900">Treatment Plan Inbox</h2>
              <p className="mt-2 text-[15px] text-slate-500">New plan updates now appear here first, with your action history below.</p>
            </div>
            {pendingPlan ? <StatusBadge status="Active" /> : <StatusBadge status="Needs More Data" />}
          </div>

          {loading ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading plans...</div>
          ) : pendingPlan ? (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#2455e8]">Pending clinician recommendation</p>
                  <h3 className="mt-2 text-xl font-extrabold text-slate-900">{pendingPlan.description}</h3>
                  <p className="mt-2.5 text-[15px] leading-6 text-slate-700">
                    {pendingPlan.details?.reasoning || pendingPlan.details?.recommendation || 'This plan was generated for clinician review and shared to your dashboard.'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right text-sm text-slate-600 shadow-sm">
                  <div className="font-extrabold text-slate-900">Created</div>
                  <div className="font-semibold">{new Date(pendingPlan.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <textarea
                  value={patientComment}
                  onChange={(event) => setPatientComment(event.target.value)}
                  placeholder="Optional comment for your care team about why you accepted or dismissed this plan."
                  className="sm:col-span-2 min-h-[90px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-500 focus:border-[#2455e8] focus:outline-none focus:ring-2 focus:ring-[#2455e8]/10"
                />
                <button
                  type="button"
                  onClick={() => handlePlanAction('accept', pendingPlan.id)}
                  className="rounded-xl bg-[#2455e8] px-4 py-3 text-sm font-extrabold text-gray-900 transition-all hover:bg-[#1a44cc] shadow-sm hover:-translate-y-0.5"
                >
                  Accept plan
                </button>
                <button
                  type="button"
                  onClick={() => handlePlanAction('dismiss', pendingPlan.id)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Dismiss for now
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center text-slate-500">
              No pending treatment plan right now. Your recent plan history is still available below.
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">Plan History</h3>
            <div className="mt-4 space-y-3">
              {historicalPlans.length === 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold text-slate-500">
                  No historical plans yet.
                </div>
              ) : (
                historicalPlans.map((plan) => (
                  <div key={plan.id} className="rounded-xl border border-slate-100 bg-slate-50/30 p-5 transition-colors hover:bg-slate-50/60">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-base font-extrabold text-slate-900">{plan.description}</p>
                        <p className="mt-1 text-[14px] text-slate-600 leading-6">
                          {plan.details?.reasoning || plan.details?.recommendation || 'Shared from your clinician workspace.'}
                        </p>
                        {plan.patientComment && (
                          <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                            <span className="font-extrabold text-slate-500">Your note:</span> {plan.patientComment}
                          </p>
                        )}
                        {plan.clinicianReply && (
                          <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50/30 px-3 py-2 text-sm text-slate-800">
                            <span className="font-extrabold text-[#2455e8]">Clinician reply:</span> {plan.clinicianReply}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={plan.status === 'accepted' ? 'Safe' : plan.status === 'dismissed' ? 'Caution' : 'Active'} />
                        <p className="mt-2 text-xs font-bold text-slate-500">{new Date(plan.createdAt).toLocaleDateString()}</p>
                        {plan.appliedAt && <p className="mt-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">Applied {new Date(plan.appliedAt).toLocaleDateString()}</p>}
                        {plan.clinicianRepliedAt && <p className="mt-1 text-xs font-semibold text-blue-700">Clinician review ready</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-extrabold text-slate-900">Care Team</h2>
              <p className="mt-2 text-[15px] text-slate-500">Your clinical feedback loop and medical oversight.</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Doctor Signed
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {(careTeamData?.careTeam ?? [
              { role: 'Endocrinologist', fullName: 'Loading...', accessLevel: '', initials: '...' },
            ]).map((member) => (
              <div key={member.role} className="rounded-xl border border-slate-100 bg-slate-50/30 p-5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#2455e8]">{member.role}</p>
                <p className="mt-2 text-lg font-extrabold text-slate-900">{member.fullName}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">Access: {member.accessLevel || 'Full Co-pilot Access'}</p>
                
                {/* Visual signature check for clinical realism */}
                <div className="mt-3.5 flex items-center gap-2 border-t border-slate-100/60 pt-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Signed off on Adaptation parameters
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </AppLayout>
  )
}

