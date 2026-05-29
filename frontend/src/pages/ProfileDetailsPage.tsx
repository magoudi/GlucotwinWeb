import { useState } from 'react'
import { AppPageHeader } from '../components/AppPageHeader'
import { AppTextInput } from '../components/AppTextInput'
import { DashboardPanel } from '../components/DashboardPanel'
import { PrototypeNotice, SelectField, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { useAccount } from '../lib/api'
import { updatePatientProfile } from '../lib/patientApi'
import { getPatientProfileMock } from '../services/mockGlucoTwinService'

type SaveState = 'idle' | 'saving' | 'success' | 'error'

export function ProfileDetailsPage() {
  const mock = getPatientProfileMock()
  const account = useAccount()
  const [draft, setDraft] = useState({
    fullName: account?.fullName ?? '',
    phone: account?.phone ?? '',
    bio: account?.bio ?? '',
    diabetesType: account?.diabetesType ?? '',
    managementType: account?.managementType ?? 'unknown',
    glucoseUnit: account?.glucoseUnit ?? 'mg/dL',
    targetGlucoseMin: account?.targetGlucoseMin ?? 80,
    targetGlucoseMax: account?.targetGlucoseMax ?? 150,
    carbRatio: account?.carbRatio ?? 11,
    correctionFactor: account?.correctionFactor ?? 42,
    insulinSensitivity: account?.insulinSensitivity ?? 42,
  })
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState('')

  async function saveProfile() {
    setSaveState('saving')
    setError('')

    try {
      await updatePatientProfile(draft)
      setSaveState('success')
    } catch (apiError) {
      setSaveState('error')
      setError(apiError instanceof Error ? apiError.message : 'Could not save profile')
    }
  }

  const basalProfile = account?.basalProfile?.length
    ? account.basalProfile.map((block) => ({ time: block.startTime, rate: block.rate }))
    : mock.basalProfile

  return (
    <AppLayout>
      <AppPageHeader
        title="Patient profile"
        description="Manage your MongoDB-backed account profile and prototype GlucoTwin settings."
        action={saveState === 'saving' ? 'Saving...' : 'Save profile'}
        onAction={saveState === 'saving' ? undefined : saveProfile}
      />
      <PrototypeNotice>Simulation only. This prototype uses clinical data and is not for real medical use.</PrototypeNotice>

      <DashboardPanel className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#25c2a0] to-[#2f6fee] text-[34px] font-extrabold text-white shadow-[0_18px_38px_rgba(47,111,238,0.2)]">
              {account?.initials ?? 'GT'}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={account?.role ?? 'patient'} />
                <StatusBadge status="Connected to MongoDB" />
                <StatusBadge status="Prototype" />
              </div>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] leading-none font-extrabold text-gray-900">{account?.fullName}</h2>
              <p className="mt-2 text-[18px] font-bold text-slate-600">{account?.email}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-right shadow-sm">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-500">Profile source</p>
            <p className="mt-1 text-[22px] font-extrabold text-gray-900">MongoDB user record</p>
          </div>
        </div>
      </DashboardPanel>

      <div className="grid gap-6 2xl:grid-cols-[1fr_0.9fr]">
        <DashboardPanel>
          <SectionHeader title="Account information" detail="Basic account fields stored on the user profile." />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <AppTextInput label="Full name" value={draft.fullName} onChange={(fullName) => setDraft((current) => ({ ...current, fullName }))} />
            <AppTextInput label="Phone" value={draft.phone} onChange={(phone) => setDraft((current) => ({ ...current, phone }))} />
            <AppTextInput label="Bio / care context" value={draft.bio} onChange={(bio) => setDraft((current) => ({ ...current, bio }))} />
            <AppTextInput label="Email" value={account?.email ?? ''} readOnly />
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <SectionHeader title="Diabetes profile" detail="Prototype settings that help shape flows." />
          <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-1">
            <AppTextInput label="Diabetes type" value={draft.diabetesType} onChange={(diabetesType) => setDraft((current) => ({ ...current, diabetesType }))} />
            <SelectField label="Management type" value={draft.managementType} options={['pump', 'injections', 'unknown']} onChange={(managementType) => setDraft((current) => ({ ...current, managementType: managementType as typeof draft.managementType }))} />
            <SelectField label="Units preference" value={draft.glucoseUnit} options={['mg/dL', 'mmol/L']} onChange={(glucoseUnit) => setDraft((current) => ({ ...current, glucoseUnit: glucoseUnit as typeof draft.glucoseUnit }))} />
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardPanel>
          <SectionHeader title="Glucose targets" detail="Saved thresholds for prototype displays and profile context." />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <AppTextInput label="Target minimum" type="number" value={String(draft.targetGlucoseMin)} onChange={(value) => setDraft((current) => ({ ...current, targetGlucoseMin: Number(value) || 0 }))} />
            <AppTextInput label="Target maximum" type="number" value={String(draft.targetGlucoseMax)} onChange={(value) => setDraft((current) => ({ ...current, targetGlucoseMax: Number(value) || 0 }))} />
          </div>
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
            <p className="text-[15px] font-extrabold uppercase tracking-[0.08em] text-slate-500">Safety range preview</p>
            <p className="mt-2 text-[28px] font-extrabold text-gray-900">{draft.targetGlucoseMin}-{draft.targetGlucoseMax} {draft.glucoseUnit}</p>
            <p className="mt-2 text-[16px] font-semibold leading-6 text-slate-600">Shown as profile context only. Clinical thresholds are not active medical logic in this prototype.</p>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <SectionHeader title="Insulin settings" detail="Stored user settings used by future real APIs; current calculations remain as simulation." />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <AppTextInput label="Carb ratio" type="number" value={String(draft.carbRatio)} onChange={(value) => setDraft((current) => ({ ...current, carbRatio: Number(value) || 0 }))} />
            <AppTextInput label="Correction factor" type="number" value={String(draft.correctionFactor)} onChange={(value) => setDraft((current) => ({ ...current, correctionFactor: Number(value) || 0 }))} />
            <AppTextInput label="Insulin sensitivity" type="number" value={String(draft.insulinSensitivity)} onChange={(value) => setDraft((current) => ({ ...current, insulinSensitivity: Number(value) || 0 }))} />
          </div>
          <h3 className="mt-8 text-[22px] font-extrabold text-gray-900">Basal profile</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {basalProfile.map((block) => (
              <div key={block.time} className="flex justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[16px] font-extrabold text-gray-900 shadow-sm">
                <span>{block.time}</span><span>{block.rate.toFixed(2)} U/h</span>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_1fr]">
        <DashboardPanel>
          <SectionHeader title="Model/prototype settings" detail="Current AI and physiological model states are demonstration-only." />
          <div className="mt-6 space-y-4">
            {mock.modelStatus.map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <p className="text-[18px] font-extrabold text-gray-900">{item.label}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-2 text-[16px] font-semibold text-slate-600">{item.value}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <SectionHeader title="Data sources" detail="Connections show what future integrations could look like." />
          <div className="mt-6 space-y-4">
            {mock.connectedSources.map((source) => (
              <div key={source.name} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                <div>
                  <p className="text-[18px] font-extrabold text-gray-900">{source.name}</p>
                  <p className="mt-1 text-[15px] font-bold text-slate-600">Last sync: {source.lastSync}</p>
                </div>
                <StatusBadge status="Data" />
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel className="border-amber-300 bg-amber-50 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <SectionHeader title="Safety disclaimer" detail="Profile settings and model statuses support this prototype experience only." />
            <p className="mt-4 max-w-4xl text-[17px] font-semibold leading-7 text-amber-700">
              Simulation only. This prototype uses clinical data and is not for real medical use. Do not use GlucoTwin prototype output for real insulin dosing or treatment decisions.
            </p>
          </div>
          <button
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-[17px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(245,158,11,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={saveState === 'saving'}
            onClick={saveProfile}
          >
            {saveState === 'saving' ? 'Saving profile...' : 'Save profile'}
          </button>
        </div>
        {saveState === 'success' && <p className="mt-4 text-[17px] font-extrabold text-emerald-600">Profile saved to MongoDB.</p>}
        {saveState === 'error' && <p className="mt-4 text-[17px] font-extrabold text-rose-600">{error}</p>}
      </DashboardPanel>
    </AppLayout>
  )
}

function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h2 className="text-[26px] font-extrabold text-gray-900">{title}</h2>
      <p className="mt-2 text-[16px] font-semibold leading-6 text-slate-500">{detail}</p>
    </div>
  )
}
