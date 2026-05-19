import { useState } from 'react'
import type { AccountUser } from '../../lib/api'
import { updateAdminUser } from '../../lib/adminApi'

type Props = {
  user: AccountUser
  onClose: () => void
  onSaved: (updated: AccountUser) => void
}

export function AdminUserEditModal({ user, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    role: user.role || 'patient',
    diabetesType: user.diabetesType || '',
    managementType: user.managementType || 'unknown',
    glucoseUnit: user.glucoseUnit || 'mg/dL',
    featureFlags: user.featureFlags || { beta_food_vision: false, advanced_what_if: false },
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFlagToggle(flag: string) {
    setForm((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [flag]: !prev.featureFlags[flag],
      },
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await updateAdminUser(user.id, form)
      onSaved(res.user)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0f1729] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />

        <div className="p-6 xl:p-8">
          <h2 className="mb-1 text-xl font-extrabold text-white">Edit User</h2>
          <p className="mb-6 text-sm font-semibold text-slate-400">Modify user details and permissions</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Full Name" value={form.fullName} onChange={(v) => handleChange('fullName', v)} />
            <Field label="Email" value={form.email} onChange={(v) => handleChange('email', v)} type="email" />

            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Role</label>
              <select
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Field label="Diabetes Type" value={form.diabetesType} onChange={(v) => handleChange('diabetesType', v)} />

            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Management Type</label>
              <select
                value={form.managementType}
                onChange={(e) => handleChange('managementType', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="pump">Pump</option>
                <option value="injections">Injections</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Glucose Unit</label>
              <select
                value={form.glucoseUnit}
                onChange={(e) => handleChange('glucoseUnit', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <label className="mb-3 block text-xs font-extrabold uppercase tracking-wider text-slate-400">Feature Flags</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featureFlags.beta_food_vision || false}
                    onChange={() => handleFlagToggle('beta_food_vision')}
                    className="size-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                  />
                  <span className="text-sm font-bold text-white">Beta Food Vision Model</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featureFlags.advanced_what_if || false}
                    onChange={() => handleFlagToggle('advanced_what_if')}
                    className="size-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
                  />
                  <span className="text-sm font-bold text-white">Advanced What-If Scenarios</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-extrabold text-slate-300 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105 hover:shadow-[0_12px_28px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white outline-none transition-colors placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
      />
    </div>
  )
}
