import { useEffect, useState } from 'react'
import type { AccountUser, TreatmentPlan } from '../../lib/api'
import { fetchClinicalNotes, addClinicalNote, createTreatmentPlan, signAndSendTreatmentPlan, fetchClinicalInsights, updateClinicalStatus, fetchPatientTreatmentPlans, replyToTreatmentPlan, type ClinicalNote, type ClinicalInsight } from '../../lib/doctorApi'
import { ClinicalAGPChart } from '../../components/ClinicalAGPChart'

type PatientDetailsPanelProps = {
  patient: AccountUser | null
  onClose: () => void
  onSimulate: (user: AccountUser) => void
  onPatientUpdate: (user: AccountUser) => void
}

export function PatientDetailsPanel({ patient, onClose, onSimulate, onPatientUpdate }: PatientDetailsPanelProps) {
  const [notes, setNotes] = useState<ClinicalNote[]>([])
  const [insights, setInsights] = useState<ClinicalInsight[]>([])
  const [newNote, setNewNote] = useState('')
  const [planDesc, setPlanDesc] = useState('')
  const [plans, setPlans] = useState<TreatmentPlan[]>([])
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [signaturePasswords, setSignaturePasswords] = useState<Record<string, string>>({})
  const [status, setStatus] = useState(patient?.clinicalStatus || 'Needs Review')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (patient) {
      setLoading(true)
      setStatus(patient.clinicalStatus || 'Needs Review')
      Promise.all([
        fetchClinicalNotes(patient.id),
        fetchClinicalInsights(patient.id),
        fetchPatientTreatmentPlans(patient.id),
      ])
        .then(([notesRes, insightsRes, plansRes]) => {
          setNotes(notesRes.notes)
          setInsights(insightsRes.insights)
          setPlans(plansRes.plans)
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    }
  }, [patient])

  if (!patient) return null

  const planTemplates = [
    {
      label: 'Evening basal review',
      text: 'Reduce evening basal rate by 10% and monitor overnight trends for the next 3 nights due to recurring low-glucose risk.',
    },
    {
      label: 'Carb ratio adjustment',
      text: 'Review lunchtime carb ratio and consider relaxing post-meal dosing because predicted lows are clustering after lunch.',
    },
    {
      label: 'Follow-up plan',
      text: 'Keep the current regimen for now, improve meal logging completeness, and re-run the digital twin review in 72 hours.',
    },
  ]

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    try {
      const res = await addClinicalNote(patient.id, newNote)
      setNotes([...notes, res.note])
      setNewNote('')
      setSuccess('Note added successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add note')
    }
  }

  const handleCreateDraftPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planDesc.trim()) return
    try {
      await createTreatmentPlan(patient.id, planDesc, { recommendation: 'basal_update' })
      const plansRes = await fetchPatientTreatmentPlans(patient.id)
      setPlans(plansRes.plans)
      setPlanDesc('')
      setSuccess('Draft treatment plan created.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create plan')
    }
  }

  const handleSignAndSend = async (planId: string) => {
    const password = signaturePasswords[planId]
    if (!password) {
      setError('Password is required to sign the treatment plan.')
      return
    }

    try {
      await signAndSendTreatmentPlan(patient.id, planId, {
        password,
        meaning: 'I approve this treatment plan for clinical use.',
      })
      const plansRes = await fetchPatientTreatmentPlans(patient.id)
      setPlans(plansRes.plans)
      setSignaturePasswords((current) => ({ ...current, [planId]: '' }))
      setSuccess('Treatment plan electronically signed and sent.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signature failed')
    }
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    try {
      await updateClinicalStatus(patient.id, newStatus)
      setStatus(newStatus)
      onPatientUpdate({ ...patient, clinicalStatus: newStatus })
      setSuccess('Status updated.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReplyToPlan = async (planId: string) => {
    const reply = replyDrafts[planId]?.trim()
    if (!reply) return

    try {
      const res = await replyToTreatmentPlan(patient.id, planId, reply)
      setPlans((current) => current.map((plan) => (plan.id === planId ? res.plan : plan)))
      setReplyDrafts((current) => ({ ...current, [planId]: '' }))
      setSuccess('Clinician reply saved.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reply to plan')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm print:hidden" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-gray-200 bg-gray-50 p-6 shadow-2xl transition-transform duration-300 sm:max-w-lg print:static print:max-w-none print:border-none print:bg-white print:text-black print:p-0 print:shadow-none print:w-full">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h2 className="text-xl font-extrabold text-gray-900">Patient Details</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-gray-900">
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4 print:border-slate-200 print:bg-slate-50">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-xl font-bold text-cyan-600 border border-cyan-500/20 print:border-slate-300 print:from-slate-100 print:to-slate-100 print:text-slate-800">
            {patient.initials}
          </div>
          <div className="flex-1">
            <div className="text-lg font-extrabold text-gray-900 print:text-black">{patient.fullName}</div>
            <div className="text-sm font-bold text-slate-500 print:text-slate-600">{patient.email}</div>
          </div>
          <div className="print:hidden">
            <select
              value={status}
              onChange={handleStatusChange}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-slate-600 focus:border-cyan-500 focus:outline-none"
            >
              <option value="Needs Review">Needs Review</option>
              <option value="Reviewed by Nurse">Reviewed by Nurse</option>
              <option value="Ready for Doctor">Ready for Doctor</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex gap-3 print:hidden">
          <button
            onClick={() => onSimulate(patient)}
            className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-extrabold text-white transition-colors"
          >
            View Simulation
          </button>
          <button
            onClick={handlePrint}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-extrabold text-slate-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Print or Save as PDF"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-red-600 print:hidden">{error}</div>}
        {success && <div className="mb-4 text-sm text-emerald-400 print:hidden">{success}</div>}

        <div className="space-y-6 overflow-y-auto pr-2 print:overflow-visible print:max-h-none" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <ClinicalAGPChart />

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-indigo-600 print:text-slate-800 uppercase tracking-wider">
              <svg className="size-4 print:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Clinical Insights
            </h3>
            <div className="space-y-3 mb-6">
              {loading && insights.length === 0 ? (
                <div className="text-sm text-slate-500">Generating insights...</div>
              ) : (
                insights.map((insight) => (
                  <div key={insight.id} className={`rounded-xl border p-4 print:border-slate-300 print:bg-white ${
                    insight.type === 'danger' ? 'bg-red-50 border-red-500/30' :
                    insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                    'bg-indigo-500/10 border-indigo-500/30'
                  }`}>
                    <h4 className={`text-sm font-extrabold mb-1 print:text-black ${
                      insight.type === 'danger' ? 'text-red-600' :
                      insight.type === 'warning' ? 'text-amber-400' :
                      'text-indigo-600'
                    }`}>{insight.title}</h4>
                    <p className="text-sm text-slate-600 print:text-slate-700 leading-relaxed mb-3">{insight.description}</p>
                    <div className="inline-flex rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-900 print:bg-slate-100 print:border-slate-300 print:text-slate-800">
                      Action: <span className="ml-1 text-cyan-600 print:text-slate-900">{insight.suggestedAction}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-extrabold text-slate-500 print:text-slate-800 uppercase tracking-wider">Clinical Notes</h3>
            {loading ? (
              <div className="text-sm text-slate-500">Loading notes...</div>
            ) : (
              <div className="space-y-3 mb-4">
                {notes.length === 0 ? (
                  <div className="text-sm text-slate-500 italic">No clinical notes found.</div>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm print:border-slate-300 print:bg-white">
                      <div className="text-slate-600 print:text-slate-800">{note.content}</div>
                      <div className="mt-2 text-xs text-slate-500 print:text-slate-500">{new Date(note.createdAt).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
            <form onSubmit={handleAddNote} className="flex gap-2 print:hidden">
              <input
                type="text"
                placeholder="Add a private clinical note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
              />
              <button type="submit" className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-white/20">
                Add
              </button>
            </form>
          </section>

          <section className="print:hidden">
            <h3 className="mb-3 text-sm font-extrabold text-slate-500 uppercase tracking-wider">Treatment Plan</h3>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <p className="text-sm text-slate-600 mb-4">Send a formal treatment plan adjustment to the patient's dashboard.</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {planTemplates.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => setPlanDesc(template.text)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-extrabold text-slate-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleCreateDraftPlan} className="space-y-3">
                <textarea
                  placeholder="e.g. Decrease evening basal rate by 10% due to frequent night lows."
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none min-h-[80px]"
                />
                <button type="submit" className="w-full rounded-lg bg-cyan-50 border border-cyan-500/30 py-2 text-sm font-bold text-cyan-600 hover:bg-cyan-500/30 transition-colors">
                  Create Draft Plan
                </button>
              </form>
            </div>
            <div className="mt-4 space-y-3">
              {plans.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-slate-500">
                  No treatment plans sent for this patient yet.
                </div>
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{plan.description}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{plan.status}</p>
                      </div>
                      <p className="text-xs font-bold text-slate-500">{new Date(plan.createdAt).toLocaleString()}</p>
                    </div>
                    
                    {plan.status === 'draft' && (
                      <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                        <p className="text-xs font-bold text-amber-400 mb-2">Electronic Signature Required</p>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="Enter password to sign"
                            value={signaturePasswords[plan.id] || ''}
                            onChange={(e) => setSignaturePasswords((current) => ({ ...current, [plan.id]: e.target.value }))}
                            className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSignAndSend(plan.id)}
                            className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-sm font-bold text-black transition-colors"
                          >
                            Sign & Send
                          </button>
                        </div>
                      </div>
                    )}
                    {plan.patientComment && (
                      <p className="mt-3 rounded-lg border border-gray-200 bg-gray-50/40 px-3 py-2 text-sm text-slate-600">
                        Patient note: {plan.patientComment}
                      </p>
                    )}
                    {plan.clinicianReply && (
                      <p className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                        Latest reply: {plan.clinicianReply}
                      </p>
                    )}
                    <div className="mt-3 grid gap-2">
                      <textarea
                        value={replyDrafts[plan.id] || ''}
                        onChange={(event) => setReplyDrafts((current) => ({ ...current, [plan.id]: event.target.value }))}
                        placeholder="Reply to the patient's comment or add follow-up guidance."
                        className="min-h-[72px] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleReplyToPlan(plan.id)}
                        className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-600 transition-colors hover:bg-cyan-50"
                      >
                        Save clinician reply
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
