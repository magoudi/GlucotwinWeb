import { useEffect, useState } from 'react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { fetchAuditLog, verifyAuditIntegrity, type AuditEntry } from '../../lib/adminApi'

export function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean, checkedEntries: number, brokenAt: string | null } | null>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchAuditLog(200)
      .then((res) => setEntries(res.entries))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const actionStyles: Record<string, string> = {
    'user.delete': 'border-red-500/30 bg-red-500/15 text-red-600',
    'user.update': 'border-amber-500/30 bg-amber-500/15 text-amber-400',
    'user.role-change': 'border-violet-500/30 bg-violet-500/15 text-violet-400',
    'user.password-reset': 'border-orange-500/30 bg-orange-500/15 text-orange-600',
  }

  const handleVerify = async () => {
    setVerifying(true)
    setVerificationResult(null)
    try {
      const res = await verifyAuditIntegrity()
      setVerificationResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return <AdminLayout><div className="flex min-h-[60vh] items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" /></div></AdminLayout>
  if (error) return <AdminLayout><div className="rounded-2xl border border-red-500/30 bg-red-50 p-6 text-center text-red-600">{error}</div></AdminLayout>

  return (
    <AdminLayout>
      <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-50/40 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-3xl sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-extrabold text-violet-400">Admin Dashboard</div>
            <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">Audit Log</h1>
            <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-600">Track all administrative actions performed on the platform.</p>
          </div>
          <div>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="rounded-xl border border-violet-500/30 bg-violet-500/20 px-5 py-3 text-sm font-extrabold text-violet-300 transition-colors hover:bg-violet-500/30 disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify Chain Integrity'}
            </button>
          </div>
        </div>
        {verificationResult && (
          <div className={`mt-6 rounded-2xl border p-5 ${verificationResult.valid ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-50 text-red-600'}`}>
            <h3 className="text-lg font-extrabold">{verificationResult.valid ? 'Audit Chain Valid' : 'Audit Chain Broken!'}</h3>
            <p className="mt-2 text-sm font-bold opacity-90">
              {verificationResult.valid 
                ? `Cryptographic signature verified for all ${verificationResult.checkedEntries} entries.`
                : `Tampering detected! Verification failed at entry: ${verificationResult.brokenAt}. Successfully verified ${verificationResult.checkedEntries} preceding entries.`
              }
            </p>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/40 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
        <div className="relative overflow-x-auto">
          {entries.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                <svg className="size-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
              </div>
              <p className="text-sm font-bold text-slate-500">No audit entries yet.</p>
              <p className="mt-1 text-xs text-slate-600">Admin actions will appear here once performed.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Target</th>
                  <th className="px-5 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-extrabold ${actionStyles[e.action] || 'border-slate-500/30 bg-slate-500/15 text-slate-500'}`}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{e.targetId || '—'}</td>
                    <td className="max-w-xs truncate px-5 py-3.5 text-slate-500">{e.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AdminLayout>
  )
}
