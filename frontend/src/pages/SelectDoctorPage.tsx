import { useEffect, useState } from 'react'
import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'
import { DashboardPanel } from '../components/DashboardPanel'
import { fetchAvailableDoctors, fetchMyDoctorRequests, createDoctorSupervisionRequest, type DoctorInfo, type SupervisionRequest } from '../lib/patientApi'

export function SelectDoctorPage() {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([])
  const [requests, setRequests] = useState<SupervisionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [requestingId, setRequestingId] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [doctorsRes, requestsRes] = await Promise.all([
        fetchAvailableDoctors(),
        fetchMyDoctorRequests(),
      ])
      setDoctors(doctorsRes.data || [])
      setRequests(requestsRes.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load doctors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function getRequestForDoctor(doctorId: string): SupervisionRequest | undefined {
    return requests.find(r => r.doctorId === doctorId || (r.doctor && r.doctor.id === doctorId))
  }

  async function handleRequest(doctorId: string) {
    setRequestingId(doctorId)
    setActionMsg('')
    try {
      await createDoctorSupervisionRequest(doctorId, 'I would like you to review my diabetes progress.')
      setActionMsg('Supervision request sent successfully!')
      setTimeout(() => setActionMsg(''), 4000)
      await loadData()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Could not send request')
    } finally {
      setRequestingId(null)
    }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
      accepted: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
      rejected: 'border-red-500/30 bg-red-500/15 text-red-400',
    }
    return (
      <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-extrabold capitalize ${styles[status] || 'border-slate-500/30 bg-slate-500/15 text-slate-400'}`}>
        {status}
      </span>
    )
  }

  return (
    <AppLayout>
      <AppPageHeader
        title="Find a Doctor"
        description="Browse available doctors and request supervision for your diabetes care."
      />

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

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
        </div>
      ) : doctors.length === 0 ? (
        <DashboardPanel title="Available Doctors">
          <div className="py-12 text-center">
            <p className="text-sm font-bold text-slate-500">No doctors are currently available.</p>
            <p className="mt-1 text-xs text-slate-600">Check back later or contact your clinic directly.</p>
          </div>
        </DashboardPanel>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const existingRequest = getRequestForDoctor(doctor.id)
            return (
              <div
                key={doctor.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-6 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all hover:border-white/20"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                <div className="relative">
                  {/* Doctor Avatar */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-500/20 text-lg font-extrabold text-blue-400 border border-blue-500/20">
                      {doctor.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white">{doctor.fullName}</h3>
                      <p className="text-xs font-bold text-slate-500">{doctor.email}</p>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="space-y-2 mb-5">
                    {doctor.specialty && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Specialty</span>
                        <span className="text-sm font-bold text-slate-300">{doctor.specialty}</span>
                      </div>
                    )}
                    {doctor.clinicName && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Clinic</span>
                        <span className="text-sm font-bold text-slate-300">{doctor.clinicName}</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  {existingRequest ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Request Status:</span>
                      {statusBadge(existingRequest.status)}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={requestingId === doctor.id}
                      onClick={() => handleRequest(doctor.id)}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(6,182,212,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {requestingId === doctor.id ? 'Sending...' : 'Request Supervision'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
