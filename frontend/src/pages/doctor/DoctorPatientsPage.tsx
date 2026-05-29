import { useEffect, useState, useCallback } from 'react'
import { DoctorLayout } from '../../layouts/DoctorLayout'
import { fetchDoctorPatients, impersonatePatient, updateBulkClinicalStatus } from '../../lib/doctorApi'
import type { AccountUser } from '../../lib/api'
import { PatientDetailsPanel } from './PatientDetailsPanel'

export function DoctorPatientsPage() {
  const [patients, setPatients] = useState<AccountUser[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<AccountUser | null>(null)
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set())
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false)

  const load = useCallback(async (q?: string, p = 1) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchDoctorPatients(q, p, 10)
      setPatients(res.patients)
      setPagination(res.pagination)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(search, page)
  }, [load, search, page])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    load(search, 1)
  }

  async function handleSimulate(user: AccountUser) {
    try {
      await impersonatePatient(user.id)
      window.location.href = '/dashboard'
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Simulation login failed')
    }
  }

  const handlePatientUpdate = (updatedPatient: AccountUser) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)))
    setSelectedPatient(updatedPatient)
  }

  const togglePatientSelection = (id: string) => {
    setSelectedPatientIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const toggleAllSelection = () => {
    if (selectedPatientIds.size === patients.length && patients.length > 0) {
      setSelectedPatientIds(new Set())
    } else {
      setSelectedPatientIds(new Set(patients.map(p => p.id)))
    }
  }

  const handleBulkUpdateStatus = async (status: string) => {
    if (selectedPatientIds.size === 0) return
    setIsUpdatingBulk(true)
    try {
      const ids = Array.from(selectedPatientIds)
      await updateBulkClinicalStatus(ids, status)
      setPatients(prev => prev.map(p => ids.includes(p.id) ? { ...p, clinicalStatus: status } : p))
      setSelectedPatientIds(new Set())
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Failed to update bulk status')
    } finally {
      setIsUpdatingBulk(false)
    }
  }
  return (
    <DoctorLayout>
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50/40 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-3xl sm:px-7 xl:px-8 xl:py-7 print:hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-400 to-indigo-600" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-extrabold text-cyan-600">
            Clinical Panel
          </div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
            Patient Directory
          </h1>
          <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-600">
            Find patients and run physiological simulations using their Digital Twin.
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      )}

      {actionMsg && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-50 p-6 text-center text-red-600">
          {actionMsg}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="size-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 py-3 pl-11 pr-4 text-sm font-bold text-gray-900 outline-none placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
        </form>
        
        {selectedPatientIds.size > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-sm font-bold text-slate-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              {selectedPatientIds.size} selected
            </span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkUpdateStatus(e.target.value)
                  e.target.value = '' // reset
                }
              }}
              disabled={isUpdatingBulk}
              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-extrabold text-cyan-600 outline-none transition-colors focus:border-cyan-500 hover:bg-cyan-50"
            >
              <option value="">Bulk Update Status...</option>
              <option value="Needs Review">Mark as Needs Review</option>
              <option value="Reviewed by Nurse">Mark as Reviewed by Nurse</option>
              <option value="Ready for Doctor">Mark as Ready for Doctor</option>
              <option value="Discharged">Mark as Discharged</option>
            </select>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/40 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl print:hidden">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-white/5 bg-white/[0.02] text-xs font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-200 bg-gray-50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-white"
                      checked={patients.length > 0 && selectedPatientIds.size === patients.length}
                      onChange={toggleAllSelection}
                    />
                  </th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4">Diabetes Type</th>
                  <th className="px-6 py-4">Management</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center font-bold text-slate-500">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id} className={`transition-colors hover:bg-white/[0.02] ${selectedPatientIds.has(p.id) ? 'bg-cyan-500/5' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-200 bg-gray-50 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-white"
                          checked={selectedPatientIds.has(p.id)}
                          onChange={() => togglePatientSelection(p.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => togglePatientSelection(p.id)}>
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 font-bold text-cyan-600 border border-cyan-500/20">
                            {p.initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900">{p.fullName}</div>
                            <div className="text-xs font-bold text-slate-500">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-gray-200">
                          {p.clinicalStatus || 'Needs Review'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.riskLevel === 'High' && <span className="inline-flex rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-400/20">High</span>}
                        {p.riskLevel === 'Medium' && <span className="inline-flex rounded-md bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-400/20">Medium</span>}
                        {(p.riskLevel === 'Low' || !p.riskLevel) && <span className="inline-flex rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/20">Low</span>}
                      </td>
                      <td className="px-6 py-4 font-bold">{p.diabetesType || 'N/A'}</td>
                      <td className="px-6 py-4 capitalize font-bold">{p.managementType}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPatient(p)}
                          className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-extrabold text-cyan-600 transition-colors hover:bg-cyan-50 mr-2"
                        >
                          Details & Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulate(p)}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-extrabold text-slate-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          Simulate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-6 py-4">
                <div className="text-sm font-bold text-slate-500">
                  Showing <span className="text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-gray-900">{pagination.total}</span> patients
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page === 1}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-extrabold text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-extrabold text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedPatient && (
        <PatientDetailsPanel 
          patient={selectedPatient} 
          onClose={() => setSelectedPatient(null)} 
          onSimulate={handleSimulate} 
          onPatientUpdate={handlePatientUpdate}
        />
      )}
    </DoctorLayout>
  )
}
