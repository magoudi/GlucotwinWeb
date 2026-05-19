import { Link } from 'react-router-dom'
import { PublicNav } from '../components/PublicNav'

const features = [
  [
    '1',
    'Personal model',
    "Learns the patient's insulin sensitivity, carb response, exercise effect, and daily rhythms.",
  ],
  [
    '2',
    'Counterfactuals',
    'Compare likely outcomes for dose timing, carb choices, activity, and stress patterns.',
  ],
  [
    '3',
    'Risk alerts',
    'Highlights hypoglycemia and hyperglycemia risk before the dangerous window arrives.',
  ],
  [
    '4',
    'Care sharing',
    'Turns raw CGM traces into explainable summaries for clinicians and caregivers.',
  ],
]

export function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#0B1120] text-white overflow-hidden">
      {/* Background glowing orbs for glassmorphic feel */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px]" />

      <PublicNav dark />
      <section className="relative mx-auto grid min-h-[850px] max-w-[1430px] grid-cols-1 items-center gap-12 px-6 pt-[150px] lg:grid-cols-2 lg:gap-8 lg:px-10 lg:pt-[200px] xl:grid-cols-[1fr_auto]">
        <div className="relative z-10 w-full max-w-[650px] justify-self-start">
          <p className="mb-11 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[17px] leading-none font-extrabold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
            AI simulation for type 1 diabetes care
          </p>
          <h1 className="max-w-[650px] text-[clamp(3.25rem,5.4vw,5.125rem)] leading-[0.98] font-extrabold tracking-[0] text-white">
            Your glucose future, safely rehearsed.
          </h1>
          <p className="mt-8 max-w-[680px] text-[21px] leading-[1.45] font-medium text-slate-300">
            GlucoTwin builds a personalized digital twin from CGM, insulin, meals, sleep, and activity data so
            patients can preview decisions before their body has to live through them.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-7 py-4 text-[16px] font-extrabold text-white shadow-[0_4px_15px_rgba(37,194,160,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_25px_rgba(37,194,160,0.4)]"
              to="/dashboard"
            >
              Explore dashboard
            </Link>
            <a
              className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-7 py-4 text-[16px] font-extrabold text-white transition-all duration-300 hover:bg-white/10 hover:shadow-[0_4px_15px_rgba(255,255,255,0.05)]"
              href="#digital-twin"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="pointer-events-none relative hidden h-[680px] w-full max-w-[500px] justify-self-end xl:max-w-[690px] lg:block">
          <div className="absolute top-[120px] left-[-30px] z-20 h-[auto] w-[340px] rounded-lg border border-white/10 bg-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md xl:top-[80px] xl:left-[72px] xl:h-[305px] xl:w-[430px]">
            <p className="mb-5 inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-[15px] xl:text-[17px] leading-none font-extrabold text-emerald-400">
              What-if simulation
            </p>
            <h2 className="text-[20px] xl:text-[24px] font-extrabold text-white">Lunch + 4u insulin</h2>
            <p className="mt-2 max-w-[335px] text-[14px] xl:text-[15px] leading-6 font-medium text-slate-300">
              Predicted peak: 168 mg/dL. Recommended pre-bolus window: 14 min.
            </p>
            <div className="mt-6 flex h-16 items-center xl:mt-8 xl:h-24">
              <div className="h-full w-px bg-white/10" />
              <div className="h-1 flex-1 bg-emerald-500/30" />
              <div className="h-3 w-24 xl:w-36 rounded-t bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <div className="h-1 w-16 xl:w-24 bg-emerald-500/30" />
              <div className="h-full w-px bg-white/10" />
            </div>
          </div>

          <div className="absolute top-[0px] right-[0px] z-10 h-[580px] w-[300px] rotate-[4deg] rounded-[40px] border-[14px] border-white/10 bg-white/5 p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md xl:top-[-40px] xl:right-[12px] xl:h-[680px] xl:w-[365px] xl:rounded-[48px] xl:border-[18px] xl:p-9">
            <div className="flex items-center justify-between">
              <p className="text-[16px] xl:text-[18px] font-extrabold text-white">Today</p>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 xl:px-4 xl:py-2 text-[14px] xl:text-[16px] font-extrabold text-emerald-400">
                In range
              </span>
            </div>
            <div className="mt-16 text-center xl:mt-24">
              <p className="text-[36px] xl:text-[44px] leading-none font-extrabold text-white">112</p>
              <p className="mt-8 text-[13px] xl:mt-12 xl:text-[14px] font-extrabold text-slate-400">mg/dL</p>
            </div>
            <div className="mt-12 space-y-3 xl:mt-16">
              {[
                ['08:00', 'Dawn rise detected, basal pattern matched.'],
                ['12:40', 'Meal twin predicts stable range after walk.'],
                ['21:10', 'Night low risk lowered by 31%.'],
              ].map(([time, text]) => (
                <div
                  key={time}
                  className="grid grid-cols-[60px_1fr] xl:grid-cols-[70px_1fr] gap-3 xl:gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 xl:px-4 xl:py-3 text-[14px] xl:text-[15px] leading-5 xl:leading-6 shadow-inner"
                >
                  <p className="font-extrabold text-white">{time}</p>
                  <p className="font-medium text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="digital-twin" className="mx-auto grid max-w-[1430px] gap-6 px-6 pb-20 md:grid-cols-2 xl:grid-cols-4 lg:px-10 relative z-10">
        {features.map(([number, title, copy]) => (
          <article key={title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(37,194,160,0.15)] hover:bg-white/10 hover:-translate-y-1">
            <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 text-[20px] font-extrabold text-emerald-400 shadow-inner">
              {number}
            </div>
            <h2 className="text-[24px] font-extrabold text-white">{title}</h2>
            <p className="mt-4 text-[16px] leading-relaxed font-medium text-slate-300">{copy}</p>
          </article>
        ))}
      </section>

      <section id="patients" className="mx-auto max-w-[1430px] px-6 pb-24 lg:px-10 relative z-10">
        <div className="grid gap-12 rounded-[32px] bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md px-8 py-16 lg:px-16 text-white lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 className="max-w-[590px] text-[40px] lg:text-[48px] leading-[1.1] font-extrabold tracking-tight">
              Designed around the decisions patients already make.
            </h2>
            <p className="mt-8 max-w-[720px] text-[18px] lg:text-[20px] leading-[1.6] font-medium text-slate-300">
              Every screen keeps the twin practical: fewer mystery graphs, more timely answers about meals,
              insulin, activity, and overnight safety.
            </p>
          </div>
          <div className="flex flex-col gap-5 lg:ml-auto w-full max-w-[500px]">
            {[
              'Connect CGM, pump, and health data',
              'Train a living twin from personal patterns',
              'Preview actions before applying them',
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-5 text-[17px] font-extrabold transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                  {i + 1}
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
