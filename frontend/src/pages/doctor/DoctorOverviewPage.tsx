import { useEffect, useState } from 'react'
import { AppMetricCard } from '../../components/AppMetricCard'
import { DashboardPanel } from '../../components/DashboardPanel'
import { DoctorLayout } from '../../layouts/DoctorLayout'
import { fetchClinicStats, type ClinicStats } from '../../lib/doctorApi'

export function DoctorOverviewPage() {
  const [stats, setStats] = useState<ClinicStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClinicStats()
      .then((res) => setStats(res.stats))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500" />
        </div>
      </DoctorLayout>
    )
  }

  if (error || !stats) {
    return (
      <DoctorLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error || 'Failed to load clinic stats'}
        </div>
      </DoctorLayout>
    )
  }

  const metricCards = [
    { label: 'Total Patients', value: String(stats.totalPatients), accent: 'from-cyan-400 to-blue-400' },
    { label: 'Patients At Risk', value: String(stats.patientsAtRisk), accent: 'from-amber-400 to-orange-400' },
    { label: 'Recent Alerts', value: String(stats.recentAlerts.length), accent: 'from-red-400 to-rose-400' },
  ]

  return (
    <DoctorLayout>
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-400 to-indigo-600" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-sm font-extrabold text-cyan-700">
            Clinical Panel
          </div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-50 to-gray-600">
            Clinic Overview
          </h1>
          <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-600">
            High-level metrics and alerts for your active patient panel.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((card) => (
          <AppMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail="Live clinic panel"
            accentClassName={card.accent}
          />
        ))}
      </div>

      <DashboardPanel className="mt-8">
        <h2 className="mb-6 text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <svg className="size-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Recent Clinical Alerts
        </h2>
        {stats.recentAlerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-bold">No active alerts at this time.</div>
        ) : (
          <div className="space-y-4">
            {stats.recentAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200 font-bold">
                    !
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900">{alert.type}</div>
                    <div className="text-xs font-bold text-slate-500">Patient: {alert.patient}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-500">{alert.time}</div>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </DoctorLayout>
  )
}
