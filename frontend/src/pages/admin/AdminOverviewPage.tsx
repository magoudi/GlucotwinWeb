import { useEffect, useState } from 'react'
import { AppMetricCard } from '../../components/AppMetricCard'
import { AdminLayout } from '../../layouts/AdminLayout'
import { fetchAdminStats, type AdminStats } from '../../lib/adminApi'

export function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="size-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
      </AdminLayout>
    )
  }

  if (!stats) return null

  const metricCards = [
    { label: 'Total Users', value: String(stats.totalUsers), accent: 'from-violet-400 to-fuchsia-400' },
    { label: 'DAU (Daily)', value: String(stats.engagement.dau), accent: 'from-cyan-400 to-blue-400' },
    { label: 'MAU (Monthly)', value: String(stats.engagement.mau), accent: 'from-blue-400 to-indigo-400' },
    { label: 'New This Week', value: String(stats.newUsersThisWeek), accent: 'from-emerald-400 to-teal-400' },
    { label: 'Simulations Today', value: String(stats.engagement.simulationsRunToday), accent: 'from-amber-400 to-orange-400' },
  ]

  const maxDiabetes = Math.max(...Object.values(stats.diabetesBreakdown), 1)

  return (
    <AdminLayout>
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-md sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-50 px-3 py-1.5 text-sm font-extrabold text-violet-600">
            Admin Dashboard
          </div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-50 to-gray-500">
            Platform Overview
          </h1>
          <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-600 xl:leading-8">
            Monitor your GlucoTwin platform health, user growth, and activity at a glance.
          </p>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 xl:gap-6">
        {metricCards.map((card) => (
          <AppMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail="Platform view"
            accentClassName={card.accent}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
        {/* Role Distribution */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md xl:p-7">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
          <div className="relative">
            <h2 className="mb-5 text-lg font-extrabold text-gray-900 xl:text-xl">Users by Role</h2>
            <div className="space-y-4">
              {Object.entries(stats.roleBreakdown).map(([role, count]) => {
                const colors: Record<string, string> = {
                  admin: 'bg-gradient-to-r from-violet-500 to-purple-500',
                  doctor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
                  patient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
                }
                const pct = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0
                return (
                  <div key={role}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-bold capitalize text-slate-600">{role}</span>
                      <span className="text-sm font-extrabold text-gray-900">{count} <span className="text-slate-500">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colors[role] || 'bg-slate-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Diabetes Breakdown */}
        <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md xl:p-7">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
          <div className="relative">
            <h2 className="mb-5 text-lg font-extrabold text-gray-900 xl:text-xl">Users by Diabetes Type</h2>
            <div className="space-y-4">
              {Object.entries(stats.diabetesBreakdown).map(([type, count]) => {
                const pct = (count / maxDiabetes) * 100
                return (
                  <div key={type}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-600">{type}</span>
                      <span className="text-sm font-extrabold text-gray-900">{count}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Recent Registrations */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md xl:p-7">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
        <div className="relative">
          <h2 className="mb-5 text-lg font-extrabold text-gray-900 xl:text-xl">Recent Registrations</h2>
          {stats.recentRegistrations.length === 0 ? (
            <p className="text-sm text-slate-500">No recent registrations this week.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentRegistrations.map((u) => (
                    <tr key={u.id} className="transition-colors hover:bg-gray-50">
                      <td className="py-3 pr-4 font-bold text-gray-900">{u.fullName}</td>
                      <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                      <td className="py-3 pr-4">
                        <RoleBadge role={u.role || 'patient'} />
                      </td>
                      <td className="py-3 text-slate-500">{u.createdAt ? new Date(u.createdAt as string).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'border-violet-200 bg-violet-50 text-violet-700',
    doctor: 'border-blue-200 bg-blue-50 text-blue-700',
    patient: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }
  return (
    <span className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-extrabold capitalize ${styles[role] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {role}
    </span>
  )
}
