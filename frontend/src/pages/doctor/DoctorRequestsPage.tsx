import { useEffect, useState } from 'react'
import { DoctorLayout } from '../../layouts/DoctorLayout'
import { fetchSupervisionRequests, respondToSupervisionRequest, type SupervisionRequestForDoctor } from '../../lib/doctorApi'

export function DoctorRequestsPage() {
  const [requests, setRequests] = useState<SupervisionRequestForDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [respondingId, setRespondingId] = useState<string | null>(null)

  async function loadRequests() {
    setLoading(true)
    setError('')
    try {
      const res = await fetchSupervisionRequests()
      setRequests(res.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function handleRespond(requestId: string, decision: 'accepted' | 'rejected') {
    setRespondingId(requestId)
    setActionMsg('')
    try {
      await respondToSupervisionRequest(requestId, decision)
      setActionMsg(`Request ${decision} successfully.`)
      setTimeout(() => setActionMsg(''), 4000)
      await loadRequests()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Could not respond to request')
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <DoctorLayout>
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]/40 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-3xl sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-400 to-indigo-600" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-extrabold text-cyan-400">
            Clinical Panel
          </div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Supervision Requests
          </h1>
          <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-300">
            Review and respond to patient supervision requests.
          </p>
        </div>
      </header>

      {actionMsg && (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-300 shadow-lg">
          {actionMsg}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
          {error}
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
        <div className="relative overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <svg className="size-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-500">No pending supervision requests.</p>
              <p className="mt-1 text-xs text-slate-600">Patient requests will appear here when submitted.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Diabetes Type</th>
                  <th className="px-6 py-4">Management</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Requested</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requests.map((req) => (
                  <tr key={req.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      {req.patient ? (
                        <div>
                          <div className="font-extrabold text-white">{req.patient.fullName}</div>
                          <div className="text-xs font-bold text-slate-500">{req.patient.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-400">{req.patient?.diabetesType || '—'}</td>
                    <td className="px-6 py-4 font-bold capitalize text-slate-400">{req.patient?.managementType || '—'}</td>
                    <td className="max-w-xs truncate px-6 py-4 text-slate-400">{req.message || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={respondingId === req.id}
                          onClick={() => handleRespond(req.id, 'accepted')}
                          className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-extrabold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={respondingId === req.id}
                          onClick={() => handleRespond(req.id, 'rejected')}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-extrabold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </DoctorLayout>
  )
}
