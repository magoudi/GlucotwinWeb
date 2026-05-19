import { useEffect, useState } from 'react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { fetchSystemInfo, type SystemInfo } from '../../lib/adminApi'

export function AdminSystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [healthOk, setHealthOk] = useState<boolean | null>(null)

  useEffect(() => {
    fetchSystemInfo()
      .then(setInfo)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/health`)
      .then((r) => r.json())
      .then((d) => setHealthOk(d.ok === true))
      .catch(() => setHealthOk(false))
  }, [])

  function fmtUp(s: number) {
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s % 60}s`].filter(Boolean).join(' ')
  }

  if (loading) return <AdminLayout><div className="flex min-h-[60vh] items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" /></div></AdminLayout>
  if (error) return <AdminLayout><div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">{error}</div></AdminLayout>
  if (!info) return null

  const cards = [
    { label: 'API Health', value: healthOk ? 'Healthy' : 'Down', accent: healthOk ? 'from-emerald-400 to-teal-400' : 'from-red-400 to-orange-400', dot: true },
    { label: 'Uptime', value: fmtUp(info.uptime), accent: 'from-cyan-400 to-blue-400' },
    { label: 'Database', value: info.databaseMode === 'in-memory' ? 'In-Memory' : 'MongoDB', accent: 'from-violet-400 to-fuchsia-400' },
    { label: 'Environment', value: info.environment, accent: 'from-amber-400 to-orange-400' },
  ]

  return (
    <AdminLayout>
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]/40 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-3xl sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-extrabold text-violet-400">Admin Dashboard</div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">System Health</h1>
          <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-300">Monitor server performance and system configuration.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
        {cards.map((c) => (
          <div key={c.label} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-5 shadow-[0_14px_34px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 xl:p-6">
            <div className="relative">
              <div className="flex items-center gap-2">
                <p className="text-sm font-extrabold text-slate-400">{c.label}</p>
                {c.dot && <div className={`size-2.5 rounded-full ${healthOk ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />}
              </div>
              <p className={`mt-2 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${c.accent}`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl xl:p-7">
        <h2 className="mb-5 text-lg font-extrabold text-white">Memory Usage</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { l: 'Heap Used', v: info.memoryUsage.heapUsedMB, mx: info.memoryUsage.heapTotalMB },
            { l: 'Heap Total', v: info.memoryUsage.heapTotalMB, mx: info.memoryUsage.rssMB },
            { l: 'RSS', v: info.memoryUsage.rssMB, mx: Math.ceil(info.memoryUsage.rssMB * 1.5) },
          ].map((m) => (
            <div key={m.l} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="mb-2 flex justify-between"><span className="text-sm font-bold text-slate-400">{m.l}</span><span className="text-sm font-extrabold text-white">{m.v} MB</span></div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${Math.min((m.v / m.mx) * 100, 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl xl:p-7">
        <h2 className="mb-5 text-lg font-extrabold text-white">Details</h2>
        <div className="divide-y divide-white/5">
          {[['Node.js', info.nodeVersion], ['Platform', info.platform], ['Database', info.databaseMode], ['Env', info.environment], ['Uptime', fmtUp(info.uptime)]].map(([l, v]) => (
            <div key={l} className="flex justify-between py-3"><span className="text-sm font-bold text-slate-400">{l}</span><span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm font-extrabold text-white">{v}</span></div>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}
