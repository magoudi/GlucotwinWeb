import { useEffect, useState } from 'react'
import { AppPageHeader } from '../components/AppPageHeader'
import { AppTextInput } from '../components/AppTextInput'
import { DashboardPanel } from '../components/DashboardPanel'
import { FieldGroup, MiniLineChart, PrototypeNotice, SelectField, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { predictBolusMock } from '../services/mockGlucoTwinService'
import { predictBolusApi } from '../services/api'

const STORAGE_KEY = 'glucotwin_bolus_inputs'

const initialInput = {
  currentGlucose: 142,
  carbs: 54,
  protein: 24,
  fat: 18,
  fiber: 7,
  mealType: 'Lunch',
  activity: 'Moderate activity',
  insulinOnBoard: 0.8,
}

function loadSavedEntries(): Array<typeof initialInput & { savedAt: string }> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed : [{ ...initialInput, ...parsed, savedAt: new Date().toISOString() }]
    }
  } catch { /* ignore */ }
  return []
}

function loadLatestInput() {
  const entries = loadSavedEntries()
  return entries.length > 0 ? entries[entries.length - 1] : initialInput
}

export function BolusPredictionPage() {
  const [input, setInput] = useState(loadLatestInput)
  const [result, setResult] = useState(() => predictBolusMock(input))
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [inputSavedMsg, setInputSavedMsg] = useState('')
  const [hasSaved, setHasSaved] = useState(() => loadSavedEntries().length > 0)

  function updateNumber(key: keyof typeof initialInput, value: string) {
    setInput((current) => ({ ...current, [key]: Number(value) || 0 }))
  }

  function saveInputs() {
    const entries = loadSavedEntries()
    entries.push({ ...input, savedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    setInputSavedMsg('Inputs saved!')
    setHasSaved(true)
    setTimeout(() => setInputSavedMsg(''), 2500)
  }

  function loadInputs() {
    const latest = loadLatestInput()
    setInput(latest)
    setInputSavedMsg('Latest saved inputs loaded!')
    setTimeout(() => setInputSavedMsg(''), 2500)
  }

  return (
    <AppLayout>
      <AppPageHeader title="Bolus prediction" description="Enter meal context and generate a bolus result for review." action="Predict bolus" onAction={() => {
        setError('')
        setSavedMsg('')
        predictBolusApi<ReturnType<typeof predictBolusMock>>(input)
          .then((res) => {
            setResult(res)
            setSavedMsg('Prediction saved to timeline.')
          })
          .catch((apiError) => setError(apiError instanceof Error ? apiError.message : 'Could not predict bolus'))
      }} />
      <PrototypeNotice>Result only. Suggested for review, not a dose to take.</PrototypeNotice>
      <div className="grid gap-6 2xl:grid-cols-[1fr_1fr]">
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Inputs</h2>
          <div className="mt-6 space-y-5">
            <FieldGroup>
              <AppTextInput label="Current glucose (mg/dL)" type="number" value={String(input.currentGlucose)} onChange={(value) => updateNumber('currentGlucose', value)} />
              <SelectField label="Meal type" value={input.mealType} options={['Breakfast', 'Lunch', 'Dinner', 'Snack']} onChange={(mealType) => setInput((current) => ({ ...current, mealType }))} />
              <AppTextInput label="Carbs (g)" type="number" value={String(input.carbs)} onChange={(value) => updateNumber('carbs', value)} />
              <AppTextInput label="Protein (g)" type="number" value={String(input.protein)} onChange={(value) => updateNumber('protein', value)} />
              <AppTextInput label="Fat (g)" type="number" value={String(input.fat)} onChange={(value) => updateNumber('fat', value)} />
              <AppTextInput label="Fiber (g)" type="number" value={String(input.fiber)} onChange={(value) => updateNumber('fiber', value)} />
              <SelectField label="Recent activity" value={input.activity} options={['Low activity', 'Moderate activity', 'High activity']} onChange={(activity) => setInput((current) => ({ ...current, activity }))} />
              <AppTextInput label="Insulin on board (U)" type="number" value={String(input.insulinOnBoard)} onChange={(value) => updateNumber('insulinOnBoard', value)} />
            </FieldGroup>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveInputs} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(6,182,212,0.25)] transition-all hover:-translate-y-0.5 hover:scale-[1.02]">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              Save Inputs
            </button>
            {hasSaved && (
              <button type="button" onClick={loadInputs} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-extrabold text-slate-300 transition-colors hover:bg-white/10">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Load Saved
              </button>
            )}
            {inputSavedMsg && <span className="text-sm font-bold text-emerald-400">{inputSavedMsg}</span>}
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Bolus result</h2>
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <StatusBadge status={result.safety.status} />
            <p className="mt-4 text-[42px] font-extrabold leading-none text-white">{result.suggestedDose} U</p>
            <p className="mt-3 text-[18px] font-bold text-slate-400">Suggested for review</p>
          </div>
          <MiniLineChart data={result.curve} height="mt-6 h-[260px]" />
          <p className="mt-5 text-[18px] leading-7 text-slate-300">{result.explanation}</p>
          {result.safety.status !== 'Safe' && (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-[17px] font-bold text-amber-300">
              Alternative safer dose for review: {result.alternativeDose} U.
            </p>
          )}
          {error && <p className="mt-4 text-[17px] font-bold text-rose-400">{error}</p>}
          {savedMsg && <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-[17px] font-bold text-emerald-400">{savedMsg}</p>}
        </DashboardPanel>
      </div>
    </AppLayout>
  )
}
