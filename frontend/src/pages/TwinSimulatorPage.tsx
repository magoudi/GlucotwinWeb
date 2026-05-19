import { useEffect, useState } from 'react'
import { AppMetricCard } from '../components/AppMetricCard'
import { AppPageHeader } from '../components/AppPageHeader'
import { AppTextInput } from '../components/AppTextInput'
import { DashboardPanel } from '../components/DashboardPanel'
import { FieldGroup, MiniLineChart, PrototypeNotice, SelectField, StatusBadge } from '../components/GlucoTwinUI'
import { AppLayout } from '../layouts/AppLayout'
import { runWhatIfScenarioMock } from '../services/mockGlucoTwinService'
import { runWhatIfApi } from '../services/api'

const STORAGE_KEY = 'glucotwin_whatif_inputs'

const initialInput = {
  foodAmount: 420,
  carbs: 62,
  protein: 26,
  fat: 20,
  bolusDose: 4.8,
  activity: 'Moderate activity',
  basalChange: 0,
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

export function TwinSimulatorPage() {
  const [input, setInput] = useState(loadLatestInput)
  const [result, setResult] = useState(() => runWhatIfScenarioMock(input))
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
      <AppPageHeader title="What-if simulator" description="Try fake food, bolus, activity, and basal changes against the physiological model." action="Run simulation" onAction={() => {
        setError('')
        setSavedMsg('')
        runWhatIfApi<ReturnType<typeof runWhatIfScenarioMock>>(input)
          .then((res) => {
            setResult(res)
            setSavedMsg('Simulation saved to timeline.')
          })
          .catch((apiError) => setError(apiError instanceof Error ? apiError.message : 'Could not run scenario'))
      }} />
      <PrototypeNotice>All curves and safety decisions are prototype data. Do not use this for real medical decisions.</PrototypeNotice>
      <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardPanel>
          <h2 className="text-[30px] font-extrabold text-white">Scenario inputs</h2>
          <div className="mt-6">
            <FieldGroup>
              <AppTextInput label="Food amount (g)" type="number" value={String(input.foodAmount)} onChange={(value) => updateNumber('foodAmount', value)} />
              <AppTextInput label="Carbs (g)" type="number" value={String(input.carbs)} onChange={(value) => updateNumber('carbs', value)} />
              <AppTextInput label="Protein (g)" type="number" value={String(input.protein)} onChange={(value) => updateNumber('protein', value)} />
              <AppTextInput label="Fat (g)" type="number" value={String(input.fat)} onChange={(value) => updateNumber('fat', value)} />
              <AppTextInput label="Bolus dose for review (U)" type="number" value={String(input.bolusDose)} onChange={(value) => updateNumber('bolusDose', value)} />
              <AppTextInput label="Basal change (%)" type="number" value={String(input.basalChange)} onChange={(value) => updateNumber('basalChange', value)} />
              <SelectField label="Activity" value={input.activity} options={['Low activity', 'Moderate activity', 'High activity']} onChange={(activity) => setInput((current) => ({ ...current, activity }))} />
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
            <h2 className="text-[30px] font-extrabold text-white">Simulation result</h2>
            <StatusBadge status={result.safety.status} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {result.predictions.map((prediction) => <AppMetricCard key={prediction.label} label={prediction.label} value={`${prediction.value} mg/dL`} detail="Glucose prediction" />)}
          </div>
          <MiniLineChart data={result.curve} height="mt-6 h-[280px]" />
          <p className="mt-5 text-[18px] leading-7 text-slate-300">{result.explanation}</p>
          <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-[17px] font-bold leading-7 text-slate-300 backdrop-blur-sm">{result.safety.message}</p>
          {error && <p className="mt-4 text-[17px] font-bold text-rose-400">{error}</p>}
          {savedMsg && <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-[17px] font-bold text-emerald-400">{savedMsg}</p>}
        </DashboardPanel>
      </div>
    </AppLayout>
  )
}
