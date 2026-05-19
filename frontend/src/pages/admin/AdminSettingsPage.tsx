import { useEffect, useState } from 'react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { fetchSystemSettings, updateSystemSettings, type SystemSettings } from '../../lib/adminApi'

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchSystemSettings()
      .then((res) => setSettings(res.settings))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    setError('')
    try {
      await updateSystemSettings(settings)
      setMsg('Settings saved successfully.')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <AdminLayout><div className="flex min-h-[60vh] items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" /></div></AdminLayout>

  return (
    <AdminLayout>
      <header className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]/40 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.4)] backdrop-blur-3xl sm:px-7 xl:px-8 xl:py-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />
        <div className="relative">
          <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-sm font-extrabold text-violet-400">Admin Dashboard</div>
          <h1 className="text-[clamp(2rem,3.2vw,3.75rem)] leading-none font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">AI & System Settings</h1>
          <p className="mt-4 text-[clamp(1rem,1.25vw,1.25rem)] leading-7 font-bold text-slate-300">Tweak global constants for the AI models and system thresholds.</p>
        </div>
      </header>

      {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">{error}</div>}
      {msg && <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-300">{msg}</div>}

      {settings && (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-6 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <h2 className="mb-4 text-lg font-extrabold text-white">Simulation Thresholds</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Global Max Basal Rate (U/h)</label>
                <p className="mb-3 text-xs text-slate-500">Maximum allowed basal rate across all simulations.</p>
                <input
                  type="number"
                  step="0.1"
                  value={settings.maxBasalRate}
                  onChange={(e) => setSettings({ ...settings, maxBasalRate: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-500/50"
                />
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Advanced What-If Scenarios</label>
                <p className="mb-3 text-xs text-slate-500">Allow users to override global maximums in what-if mode.</p>
                <label className="flex h-[46px] cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4">
                  <input
                    type="checkbox"
                    checked={settings.enableAdvancedWhatIf}
                    onChange={(e) => setSettings({ ...settings, enableAdvancedWhatIf: e.target.checked })}
                    className="size-4 rounded border-white/20 bg-white/5 text-violet-500"
                  />
                  <span className="text-sm font-bold text-white">Enable Advanced Mode</span>
                </label>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-6 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
            <h2 className="mb-4 text-lg font-extrabold text-white">Default Patient Targets</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Default Target Min (mg/dL)</label>
                <input
                  type="number"
                  value={settings.defaultTargetMin}
                  onChange={(e) => setSettings({ ...settings, defaultTargetMin: parseInt(e.target.value, 10) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Default Target Max (mg/dL)</label>
                <input
                  type="number"
                  value={settings.defaultTargetMax}
                  onChange={(e) => setSettings({ ...settings, defaultTargetMax: parseInt(e.target.value, 10) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
