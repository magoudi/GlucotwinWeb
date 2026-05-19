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
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm font-bold text-red-200">
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
              <h2 className="text-[26px] font-extrabold text-white">Treatment Plan Inbox</h2>
              <p className="mt-2 text-[15px] text-slate-300">New plan updates now appear here first, with your action history below.</p>
            </div>
            {pendingPlan ? <StatusBadge status="Active" /> : <StatusBadge status="Needs More Data" />}
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">Loading plans...</div>
          ) : pendingPlan ? (
            <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 shadow-[0_16px_40px_rgba(34,211,238,0.12)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">Pending clinician recommendation</p>
                  <h3 className="mt-2 text-xl font-extrabold text-white">{pendingPlan.description}</h3>
                  <p className="mt-2 text-sm text-cyan-100/90">
                    {pendingPlan.details?.reasoning || pendingPlan.details?.recommendation || 'This plan was generated for clinician review and shared to your dashboard.'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0B1120]/40 px-4 py-3 text-right text-sm text-slate-300">
                  <div className="font-bold text-white">Created</div>
                  <div>{new Date(pendingPlan.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <textarea
                  value={patientComment}
                  onChange={(event) => setPatientComment(event.target.value)}
                  placeholder="Optional comment for your care team about why you accepted or dismissed this plan."
                  className="sm:col-span-2 min-h-[90px] rounded-xl border border-white/10 bg-[#0B1120]/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handlePlanAction('accept', pendingPlan.id)}
                  className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-extrabold text-[#0B1120] transition-colors hover:bg-cyan-300"
                >
                  Accept plan
                </button>
                <button
                  type="button"
                  onClick={() => handlePlanAction('dismiss', pendingPlan.id)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/10"
                >
                  Dismiss for now
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-slate-400">
              No pending treatment plan right now. Your recent plan history is still available below.
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-extrabold text-white">Plan History</h3>
            <div className="mt-4 space-y-3">
              {historicalPlans.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm font-bold text-slate-400">
                  No historical plans yet.
                </div>
              ) : (
                historicalPlans.map((plan) => (
                  <div key={plan.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-white">{plan.description}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {plan.details?.reasoning || plan.details?.recommendation || 'Shared from your clinician workspace.'}
                        </p>
                        {plan.patientComment && (
                          <p className="mt-3 rounded-xl border border-white/10 bg-[#0B1120]/50 px-3 py-2 text-sm text-slate-300">
                            Your note: {plan.patientComment}
                          </p>
                        )}
                        {plan.clinicianReply && (
                          <p className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                            Clinician reply: {plan.clinicianReply}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <StatusBadge status={plan.status === 'accepted' ? 'Safe' : plan.status === 'dismissed' ? 'Caution' : 'Active'} />
                        <p className="mt-2 text-xs font-bold text-slate-500">{new Date(plan.createdAt).toLocaleString()}</p>
                        {plan.appliedAt && <p className="mt-1 text-xs font-bold text-emerald-300">Applied {new Date(plan.appliedAt).toLocaleString()}</p>}
                        {plan.clinicianRepliedAt && <p className="mt-1 text-xs font-bold text-cyan-300">Replied {new Date(plan.clinicianRepliedAt).toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <h2 className="text-[24px] font-extrabold text-white">Care Team</h2>
          <p className="mt-2 text-[15px] text-slate-300">Your support loop for plan review, safety questions, and ongoing follow-up.</p>
          <div className="mt-6 space-y-4">
            {(careTeamData?.careTeam ?? [
              { role: 'Endocrinologist', fullName: 'Loading...', accessLevel: '', initials: '...' },
            ]).map((member) => (
              <div key={member.role} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">{member.role}</p>
                <p className="mt-2 text-lg font-extrabold text-white">{member.fullName}</p>
                <p className="mt-2 text-sm text-slate-400">Access: {member.accessLevel || 'Standard'}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </AppLayout>
  )
}
