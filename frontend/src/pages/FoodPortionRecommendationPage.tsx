import { useEffect, useState } from 'react'
import { AppPageHeader } from '../components/AppPageHeader'
import { AppTextInput } from '../components/AppTextInput'
import { DashboardPanel } from '../components/DashboardPanel'
import { FieldGroup, MiniLineChart, PrototypeNotice, SelectField, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { recommendFoodPortionMock } from '../services/mockGlucoTwinService'
import { recommendFoodApi } from '../services/api'

const STORAGE_KEY = 'glucotwin_food_inputs'

const initialInput = {
  food: 'rice bowl',
  mealType: 'Dinner',
  currentGlucose: 136,
  context: 'Moderate activity today',
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

export function FoodPortionRecommendationPage() {
  const [input, setInput] = useState(loadLatestInput)
  const [result, setResult] = useState(() => recommendFoodPortionMock(input))
  const [error, setError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [inputSavedMsg, setInputSavedMsg] = useState('')
  const [hasSaved, setHasSaved] = useState(() => loadSavedEntries().length > 0)

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
      <AppPageHeader title="Food portion recommendation" description="Meal portion result with macros and simulated glucose response." action="Recommend portion" onAction={() => {
        setError('')
        setSavedMsg('')
        recommendFoodApi<ReturnType<typeof recommendFoodPortionMock>>(input)
          .then((res) => {
            setResult(res)
            setSavedMsg('Food recommendation saved to timeline.')
          })
          .catch((apiError) => setError(apiError instanceof Error ? apiError.message : 'Could not recommend food portion'))
      }} />
      <PrototypeNotice>Simulation result only. This prototype does not make real nutrition or insulin recommendations.</PrototypeNotice>
      <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Meal inputs</h2>
          <div className="mt-6 space-y-5">
            <FieldGroup>
              <AppTextInput label="Meal name or food type" value={input.food} onChange={(food) => setInput((current) => ({ ...current, food }))} />
              <SelectField label="Meal type" value={input.mealType} options={['Breakfast', 'Lunch', 'Dinner', 'Snack']} onChange={(mealType) => setInput((current) => ({ ...current, mealType }))} />
              <AppTextInput label="Current glucose (mg/dL)" type="number" value={String(input.currentGlucose)} onChange={(value) => setInput((current) => ({ ...current, currentGlucose: Number(value) || 0 }))} />
              <SelectField label="Activity / sleep context" value={input.context} options={['Moderate activity today', 'High activity planned', 'Poor sleep last night', 'Quiet recovery day']} onChange={(context) => setInput((current) => ({ ...current, context }))} />
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="text-[30px] font-extrabold text-white">Portion result</h2>
            <StatusBadge status={result.safety.status} />
          </div>
          <p className="mt-5 text-[34px] font-extrabold text-white">{result.portion}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {Object.entries(result.macros).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
                <p className="capitalize text-[15px] font-bold text-slate-400">{label}</p>
                <p className="mt-2 text-[26px] font-extrabold text-white">{value} g</p>
              </div>
            ))}
          </div>
          <MiniLineChart data={result.glucosePrediction} height="mt-6 h-[260px]" />
          <p className={`mt-5 rounded-lg border p-4 text-[17px] font-bold leading-7 ${result.safety.status === 'Safe' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
            {result.warning}
          </p>
          {error && <p className="mt-4 text-[17px] font-bold text-rose-400">{error}</p>}
          {savedMsg && <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-[17px] font-bold text-emerald-400">{savedMsg}</p>}
        </DashboardPanel>
      </div>
    </AppLayout>
  )
}
