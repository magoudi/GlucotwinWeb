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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-600" />

        <div className="p-6 xl:p-8">
          <h2 className="mb-1 text-xl font-extrabold text-gray-900">Edit User</h2>
          <p className="mb-6 text-sm font-semibold text-slate-500">Modify user details and permissions</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Full Name" value={form.fullName} onChange={(v) => handleChange('fullName', v)} />
            <Field label="Email" value={form.email} onChange={(v) => handleChange('email', v)} type="email" />

            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Role</label>
              <select
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Field label="Diabetes Type" value={form.diabetesType} onChange={(v) => handleChange('diabetesType', v)} />

            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Management Type</label>
              <select
                value={form.managementType}
                onChange={(e) => handleChange('managementType', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="pump">Pump</option>
                <option value="injections">Injections</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Glucose Unit</label>
              <select
                value={form.glucoseUnit}
                onChange={(e) => handleChange('glucoseUnit', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <label className="mb-3 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Feature Flags</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featureFlags.beta_food_vision || false}
                    onChange={() => handleFlagToggle('beta_food_vision')}
                    className="size-4 rounded border-gray-300 bg-gray-50 text-violet-500 focus:ring-violet-500/30"
                  />
                  <span className="text-sm font-bold text-gray-900">Beta Food Vision Model</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featureFlags.advanced_what_if || false}
                    onChange={() => handleFlagToggle('advanced_what_if')}
                    className="size-4 rounded border-gray-300 bg-gray-50 text-violet-500 focus:ring-violet-500/30"
                  />
                  <span className="text-sm font-bold text-gray-900">Advanced What-If Scenarios</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-extrabold text-slate-600 transition-colors hover:bg-gray-50"
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
      <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
      />
    </div>
  )
}
