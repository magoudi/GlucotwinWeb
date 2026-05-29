import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { PublicNav } from '../components/PublicNav'
import './LandingPage.css'

type ScenarioMode = 'do' | 'dont'
type GlyphKind = 'basal' | 'bolus' | 'food' | 'safety' | 'check' | 'cross'

const primaryNavSections = [
  { id: 'use-cases', label: 'Why GlucoTwin' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'results', label: 'Results' },
  { id: 'testimonials', label: 'Voices' },
  { id: 'faq', label: 'FAQ' },
]

const railSections = [
  { id: 'hero', label: 'Fresh' },
  { id: 'use-cases', label: 'Goals' },
  { id: 'how-it-works', label: 'Flow' },
  { id: 'capabilities', label: 'Twin' },
  { id: 'results', label: 'Proof' },
  { id: 'testimonials', label: 'Voices' },
  { id: 'faq', label: 'FAQ' },
]

const heroStats = [
  { value: '80.03%', label: 'Safe acceptance rate', accent: '#1f56c8' },
  { value: '0', label: 'Severe hypo events approved', accent: '#5e8df0' },
  { value: '698,712', label: 'Training records processed', accent: '#9ebdff' },
]

const headlineMetrics = [
  { value: 80.03, decimals: 2, suffix: '%', label: 'Safe Acceptance Rate' },
  { value: 0, decimals: 0, label: 'Severe Hypo Events Accepted' },
  { value: 2494, decimals: 0, label: 'Total Events Evaluated' },
  { value: 698712, decimals: 0, suffix: '+', label: 'Training Records' },
]

const scenarioCards: Record<ScenarioMode, { title: string; copy: string }[]> = {
  do: [
    {
      title: 'Personal digital twin',
      copy: 'A physiological model of you, continuously tuned during an initial adaptation phase and beyond.',
    },
    {
      title: '30 / 60 / 120 min forecasts',
      copy: 'See predicted glucose trajectories before you act, not after the fact.',
    },
    {
      title: 'Three adaptive AI models',
      copy: 'Basal schedule, bolus dose, and food portion recommendations trained on population data, personalized to you.',
    },
    {
      title: 'Safety gate on every tip',
      copy: 'No recommendation reaches you until the twin simulates your response and marks it safe.',
    },
    {
      title: 'What-if scenarios',
      copy: 'Compare meals and insulin choices side by side with simulated outcomes before you commit.',
    },
    {
      title: 'Continuous learning loop',
      copy: 'Real-time data and safety feedback refine predictions continuously as daily patterns change.',
    },
  ],
  dont: [
    {
      title: 'Reactive guessing',
      copy: 'Treatment happens only after glucose already spiked or dropped, so every decision starts late.',
    },
    {
      title: 'No forecasting window',
      copy: 'You act on the current number only, without a preview of what the next hour could look like.',
    },
    {
      title: 'One-size-fits-all',
      copy: 'Generic dosing tables ignore the physiology, routines, and sensitivity that make every patient different.',
    },
    {
      title: 'No safety net',
      copy: 'Potentially unsafe corrections have no simulation check before they reach the person making the decision.',
    },
    {
      title: 'No scenario planning',
      copy: 'Every meal or exercise choice becomes a real-world experiment instead of a staged rehearsal.',
    },
    {
      title: 'Static model',
      copy: 'No learning loop means the system cannot adapt as schedules, illness, sleep, or sensitivity shift over time.',
    },
  ],
}

const workStages = [
  {
    number: '01',
    badge: 'INTAKE',
    title: 'Connect your data',
    copy: 'Link CGM, pump or pen logs, meals, and activity. Historical diabetes datasets bootstrap your twin baseline.',
    footer: 'KICKOFF',
    accent: '#f2f2f2',
  },
  {
    number: '02',
    badge: 'ADAPT',
    title: 'Initial adaptation phase',
    copy: 'During onboarding, GlucoTwin observes real-time patterns to calibrate insulin sensitivity, carb ratios, and daily rhythms.',
    footer: 'CALIBRATE',
    accent: '#d8d8d8',
  },
  {
    number: '03',
    badge: 'PREDICT',
    title: 'AI recommendations',
    copy: 'Dedicated models suggest basal timing, bolus units, and food portions tailored to your current context.',
    footer: 'MODELS',
    accent: '#bbbbbb',
  },
  {
    number: '04',
    badge: 'SIMULATE',
    title: 'Physiological safety check',
    copy: 'Every suggestion runs through your digital twin. Unsafe outcomes are blocked; safe ones show predicted glucose curves.',
    footer: 'VERIFY',
    accent: '#959595',
  },
  {
    number: '05',
    badge: 'DECIDE',
    title: 'Act with confidence',
    copy: 'Review 30 / 60 / 120 minute forecasts, run what-if scenarios, and choose the option your care team supports.',
    footer: 'SUPPORT',
    accent: '#6f6f6f',
  },
]

const capabilities = [
  {
    kind: 'basal' as const,
    label: 'BASAL AI',
    title: 'Basal schedule prediction',
    copy: 'Learns overnight and daytime basal needs from your history, then adjusts as patterns shift.',
    roles: 'Overnight stability, dawn phenomenon, sick-day basal shifts',
    accent: '#ececec',
  },
  {
    kind: 'bolus' as const,
    label: 'BOLUS AI',
    title: 'Bolus dose prediction',
    copy: 'Context-aware meal and correction dose suggestions with confidence bands.',
    roles: 'Meal bolus, correction factor, IOB-aware dosing',
    accent: '#cfcfcf',
  },
  {
    kind: 'food' as const,
    label: 'FOOD AI',
    title: 'Food portion recommendation',
    copy: 'Portion guidance aligned to your carb ratio, activity, and target glucose range.',
    roles: 'Meal planning, restaurant estimates, post-exercise refuel',
    accent: '#b3b3b3',
  },
  {
    kind: 'safety' as const,
    label: 'SAFETY MODEL',
    title: 'Physiological simulation',
    copy: 'Virtual patient runs before you see any AI output, with hypo and hyper risk screened in advance.',
    roles: 'Safety gate, curve preview, care-team export',
    accent: '#8d8d8d',
  },
]

const resultsCards = [
  { value: 80.03, decimals: 2, suffix: '%', label: 'Safe insulin recommendations accepted' },
  { value: 0, decimals: 0, label: 'Severe hypoglycemia events approved' },
  { value: 2494, decimals: 0, label: 'Total clinical events evaluated' },
  { value: 698712, decimals: 0, label: 'Training data records processed' },
  { value: 4, decimals: 0, label: 'Real-world patient datasets in training' },
  { value: 71, decimals: 0, label: 'Unique patient profiles represented' },
]

const testimonials = [
  {
    quote: 'Seeing the 60-minute curve before dinner changed how I bolus. Fewer post-meal spikes without chasing highs.',
    name: 'Maya R.',
    role: 'T1D · 12 years',
    initial: 'M',
  },
  {
    quote: 'The safety layer matters. Recommendations arrive with simulated outcomes, not guesswork dressed up as AI.',
    name: 'Dr. James Okonkwo',
    role: 'Endocrinologist',
    initial: 'D',
  },
  {
    quote: 'What-if for pizza night gave us three scenarios with risk flags. We picked the one that stayed in range.',
    name: 'Alex T.',
    role: 'Parent · teen T1D',
    initial: 'A',
  },
  {
    quote: 'Adaptation picked up my training days within two weeks. Basal suggestions finally match my real sensitivity.',
    name: 'Priya S.',
    role: 'T1D · athlete',
    initial: 'P',
  },
]

const faqs = [
  {
    question: 'Is GlucoTwin a replacement for my care team?',
    answer:
      'No. GlucoTwin is decision support. It stages predictions to inform conversations and daily choices, but it does not replace medical advice, prescribing rules, or your clinician’s plan.',
  },
  {
    question: 'What happens during the adaptation phase?',
    answer:
      'For roughly two weeks, the physiological model watches your glucose, insulin, and meal patterns to personalize insulin sensitivity, carbohydrate response, and daily rhythms before stronger recommendations begin.',
  },
  {
    question: 'How does the safety check work?',
    answer:
      'The AI proposes candidate actions, then the digital twin simulates the next 30, 60, and 120 minutes. Unsafe outcomes are rejected or adjusted, and only safe candidates move forward.',
  },
  {
    question: 'What data do you use to train the models?',
    answer:
      'The project report cites 698,712 records drawn from 71 unique patients across four datasets: AZT1D, HUPA-UCM, OhioT1DM, and Shanghai_T1DM.',
  },
  {
    question: 'Does it work with CGM and pump data?',
    answer:
      'That is the intended product direction. The current project experience is designed around CGM, pump or pen logs, meals, and activity, with future work planned for heart rate, sleep, and stress signals.',
  },
  {
    question: 'Is this clinically approved today?',
    answer:
      'No. The report explicitly frames GlucoTwin as a research and simulation-based system. Real-world deployment would need stronger validation, regulatory review, medical supervision, cybersecurity controls, and usability testing.',
  },
]

type AnimatedValueProps = {
  active: boolean
  decimals?: number
  grouped?: boolean
  reducedMotion?: boolean
  suffix?: string
  value: number
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const syncMatch = () => setMatches(mediaQuery.matches)

    syncMatch()
    mediaQuery.addEventListener('change', syncMatch)

    return () => mediaQuery.removeEventListener('change', syncMatch)
  }, [query])

  return matches
}

function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

function AnimatedValue({
  active,
  decimals = 0,
  grouped = true,
  reducedMotion = false,
  suffix = '',
  value,
}: AnimatedValueProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active || reducedMotion) {
      return
    }

    let frame = 0
    const start = performance.now()
    const duration = 1500

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplay(value * eased)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [active, reducedMotion, value])

  const shownValue = active ? (reducedMotion ? value : display) : 0

  return (
    <>
      {shownValue.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
        useGrouping: grouped,
      })}
      {suffix}
    </>
  )
}

function Glyph({ kind }: { kind: GlyphKind }) {
  const sharedProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
  }

  switch (kind) {
    case 'check':
      return (
        <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20">
          <path d="M4 10.5 8 14.5 16 5.5" {...sharedProps} />
        </svg>
      )
    case 'cross':
      return (
        <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20">
          <path d="M5 5 15 15" {...sharedProps} />
          <path d="M15 5 5 15" {...sharedProps} />
        </svg>
      )
    case 'basal':
      return (
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="7" {...sharedProps} />
          <path d="M12 8v4l2.8 1.8" {...sharedProps} />
        </svg>
      )
    case 'bolus':
      return (
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
          <path d="m6 7 3-3 8 8-3 3Z" {...sharedProps} />
          <path d="m13 3 8 8" {...sharedProps} />
          <path d="m5 17 4 4" {...sharedProps} />
          <path d="m4 20 3-3" {...sharedProps} />
        </svg>
      )
    case 'food':
      return (
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5.5" {...sharedProps} />
          <path d="M4.8 4.5v6.2" {...sharedProps} />
          <path d="M7 4.5v6.2" {...sharedProps} />
          <path d="M5.9 4.5v15" {...sharedProps} />
          <path d="M18.8 4.5v15" {...sharedProps} />
          <path d="M15.8 4.5c0 2.6 2 2.9 2 5.8" {...sharedProps} />
        </svg>
      )
    case 'safety':
      return (
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
          <path d="M12 4 18 6.7v4.5c0 3.8-2.6 7.1-6 8.8-3.4-1.7-6-5-6-8.8V6.7Z" {...sharedProps} />
          <path d="m9.2 11.8 1.8 1.8 3.8-4.2" {...sharedProps} />
        </svg>
      )
  }
}

export function LandingPage() {
  const heroMediaRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isWideViewport = useMediaQuery('(min-width: 1280px)')
  const [scenarioMode, setScenarioMode] = useState<ScenarioMode>('do')
  const [openFaq, setOpenFaq] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')
  const [headlineMetricsVisible, setHeadlineMetricsVisible] = useState(false)
  const [resultsVisible, setResultsVisible] = useState(false)
  const [heroMediaInView, setHeroMediaInView] = useState(false)

  const shouldRenderHeroVideo = heroMediaInView && isWideViewport && !prefersReducedMotion

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))

    if (!revealNodes.length) {
      return
    }

    if (prefersReducedMotion) {
      revealNodes.forEach((node) => node.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.16,
      },
    )

    revealNodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [prefersReducedMotion])

  useEffect(() => {
    const observedSections = railSections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement)

    if (!observedSections.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (visibleEntry?.target instanceof HTMLElement) {
          setActiveSection(visibleEntry.target.id)
        }
      },
      {
        rootMargin: '-24% 0px -48% 0px',
        threshold: [0.2, 0.35, 0.55],
      },
    )

    observedSections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const metricsTargets = ['results-bar', 'results']
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement)

    if (!metricsTargets.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) {
            return
          }

          if (entry.target.id === 'results-bar') {
            setHeadlineMetricsVisible(true)
          }

          if (entry.target.id === 'results') {
            setResultsVisible(true)
          }
        })
      },
      {
        threshold: 0.32,
      },
    )

    metricsTargets.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!heroMediaRef.current || !isWideViewport || prefersReducedMotion) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHeroMediaInView(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.35,
      },
    )

    observer.observe(heroMediaRef.current)

    return () => observer.disconnect()
  }, [isWideViewport, prefersReducedMotion])

  return (
    <main className="marketing-page min-h-screen overflow-x-hidden text-[#111111]">
      <PublicNav activeSection={activeSection} sections={primaryNavSections} />

      <aside className="section-rail hidden 2xl:flex">
        {railSections.map((section) => {
          const isActive = activeSection === section.id

          return (
            <a
              key={section.id}
              className={`section-rail-link ${isActive ? 'is-active' : ''}`}
              href={`#${section.id}`}
            >
              <span>{section.label}</span>
              <span className="section-rail-wave" aria-hidden="true" />
            </a>
          )
        })}
      </aside>

      <section
        id="hero"
        className="relative mx-auto max-w-[1500px] px-4 pb-22 pt-32 sm:px-6 lg:px-8 lg:pb-24 lg:pt-[9.4rem] xl:pt-[10.5rem]"
      >
        <div className="grid items-center gap-12 xl:grid-cols-[0.9fr_1.1fr] xl:gap-10">
          <div className="reveal-on-scroll relative z-10" data-reveal>
            <span className="hero-eyebrow">
              <span aria-hidden="true">⬡</span>
              DIGITAL TWIN TECHNOLOGY
            </span>
            <p className="mt-8 max-w-[160px] text-[12px] font-semibold tracking-[0.28em] text-slate-500 uppercase">
              Simulation-backed decisions for Type 1 Diabetes
            </p>
            <h1 className="mt-5 font-[var(--font-display)] text-[clamp(3.5rem,8vw,7.2rem)] leading-[0.9] font-bold tracking-[-0.07em] text-[#111111]">
              Your Body&apos;s
              <br />
              AI-Powered
              <br />
              <span className="text-gradient">Digital Twin</span>
            </h1>
            <p className="mt-7 max-w-[620px] text-[18px] leading-8 font-medium text-slate-600 sm:text-[20px]">
              GlucoTwin creates a real-time physiological simulation of the body, predicting glucose,
              optimizing insulin, and checking safety before a recommendation ever reaches the screen.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link className="cta-primary" to="/create-account">
                Try GlucoTwin
                <span aria-hidden="true">→</span>
              </Link>
              <a className="cta-secondary" href="#how-it-works">
                Watch Demo
              </a>
            </div>

            <p className="mt-5 text-[13px] leading-7 text-slate-500">
              Research prototype for decision support. Not a replacement for clinician guidance or
              medical advice.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="hero-stat-pill bg-slate-50 border-slate-200">
                  <span className="hero-stat-dot" style={{ backgroundColor: stat.accent }} />
                  <span className="font-semibold text-[#111111]">{stat.value}</span>
                  <span className="text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>

            <p className="mt-8 font-[var(--font-mono)] text-[11px] tracking-[0.22em] text-slate-500 uppercase">
              Powered by GRU · Reinforcement Learning · Hovorka-inspired simulation
            </p>
          </div>

          <div className="reveal-on-scroll relative" data-reveal>
            <div className="hero-stage">
              <div className="hero-grid" aria-hidden="true" />
              {shouldRenderHeroVideo ? (
                <div aria-hidden="true">
                  {Array.from({ length: 24 }, (_, index) => {
                    const style = {
                      animationDelay: `${index * 0.3}s`,
                      animationDuration: `${8 + (index % 5)}s`,
                      height: `${index % 3 === 0 ? 7 : 4 + (index % 4)}px`,
                      left: `${6 + ((index * 17) % 88)}%`,
                      top: `${8 + ((index * 13) % 74)}%`,
                      width: `${index % 3 === 0 ? 7 : 4 + (index % 4)}px`,
                    } as CSSProperties

                    return <span key={`particle-${index}`} className="hero-particle" style={style} />
                  })}
                </div>
              ) : null}

              <div className="hero-stage-content">
                <div className="hero-panel hero-panel--left surface-card">
                  <p className="panel-label">Glucose monitor</p>
                  <svg aria-hidden="true" className="mt-4 h-[126px] w-full" viewBox="0 0 220 126">
                    <rect x="12" y="32" width="196" height="52" rx="18" fill="rgba(17,17,17,0.04)" />
                    <line x1="12" y1="28" x2="208" y2="28" stroke="rgba(17,17,17,0.28)" strokeDasharray="6 6" />
                    <line x1="12" y1="58" x2="208" y2="58" stroke="rgba(17,17,17,0.08)" />
                    <line x1="12" y1="84" x2="208" y2="84" stroke="rgba(17,17,17,0.08)" />
                    <line x1="44" y1="24" x2="44" y2="98" stroke="rgba(17,17,17,0.08)" />
                    <line x1="92" y1="24" x2="92" y2="98" stroke="rgba(17,17,17,0.08)" />
                    <line x1="140" y1="24" x2="140" y2="98" stroke="rgba(17,17,17,0.08)" />
                    <line x1="188" y1="24" x2="188" y2="98" stroke="rgba(17,17,17,0.08)" />
                    <polyline
                      fill="none"
                      points="18,74 34,68 48,42 66,58 78,54 94,44 108,46 124,38 140,50 156,62 174,70 192,66 204,72"
                      stroke="#111111"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="204" cy="72" r="5.5" fill="#111111" />
                    <circle cx="204" cy="72" r="12" fill="rgba(17,17,17,0.12)" />
                    <text x="16" y="118" fill="#8a8a8a" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2">
                      30m
                    </text>
                    <text x="96" y="118" fill="#8a8a8a" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2">
                      60m
                    </text>
                    <text x="176" y="118" fill="#8a8a8a" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2">
                      120m
                    </text>
                  </svg>
                  <p className="mt-4 text-[14px] font-semibold text-[#111111]">Current: 112 mg/dL ✓</p>
                  <div className="mt-5">
                    <span className="hero-status-badge">Safety gate: active</span>
                  </div>
                </div>

                <div className="hero-panel hero-panel--right surface-card">
                  <p className="panel-label">Health metrics</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ['Heart Rate', '74 BPM'],
                      ['Activity', 'Moderate'],
                      ['Insulin', '0.3 U/h'],
                    ].map(([label, value]) => (
                      <div key={label} className="metric-row">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <span className="hero-status-badge hero-status-badge--secondary">Safety gate: secure ✓</span>
                  </div>
                </div>

                <div className="hero-media" ref={heroMediaRef}>
                  <div className="hero-media-shell">
                    <img
                      alt=""
                      aria-hidden="true"
                      className="hero-poster"
                      decoding="async"
                      fetchPriority="high"
                      loading="eager"
                      src="/hologram-poster.jpg"
                    />
                    {shouldRenderHeroVideo ? (
                      <video
                        autoPlay
                        className="hero-video"
                        loop
                        muted
                        playsInline
                        poster="/hologram-poster.jpg"
                        preload="metadata"
                      >
                        <source src="/hologram.mp4" type="video/mp4" />
                      </video>
                    ) : null}
                    <div className="hero-media-vignette" aria-hidden="true" />
                    <div className="hero-glow" aria-hidden="true" />
                  </div>

                  <span className="hero-chip hero-chip--one">GRU</span>
                  <span className="hero-chip hero-chip--two">RL</span>
                  <span className="hero-chip hero-chip--three">Safety gate</span>
                  <span className="hero-chip hero-chip--four">30 / 60 / 120</span>

                  {shouldRenderHeroVideo ? (
                    <>
                      <div className="hero-orbit hero-orbit--one" aria-hidden="true">
                        <span className="hero-orbit-node" />
                      </div>
                      <div className="hero-orbit hero-orbit--two" aria-hidden="true">
                        <span className="hero-orbit-node" />
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="hero-summary surface-card">
                  <div>
                    <p className="panel-label">Current scenario</p>
                    <p className="mt-3 text-[26px] font-bold tracking-[-0.05em] text-[#111111]">Lunch + walk</p>
                  </div>
                  <div className="hero-summary-metrics">
                    <div>
                      <span>Predicted peak</span>
                      <strong>164 mg/dL</strong>
                    </div>
                    <div>
                      <span>Suggested pre-bolus</span>
                      <strong>13 min</strong>
                    </div>
                    <div>
                      <span>Risk state</span>
                      <strong>Secure</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="results-bar" className="stats-strip" data-reveal>
        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {headlineMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`stats-strip-card ${index < headlineMetrics.length - 1 ? 'stats-strip-card--bordered' : ''}`}
            >
              <p className="stats-strip-value">
                <AnimatedValue
                  active={headlineMetricsVisible}
                  decimals={metric.decimals}
                  reducedMotion={prefersReducedMotion}
                  suffix={metric.suffix}
                  value={metric.value}
                />
              </p>
              <p className="stats-strip-label">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="use-cases" className="mx-auto max-w-[1500px] px-4 pb-22 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="section-kicker reveal-on-scroll" data-reveal>
            DECISION ADVANTAGE
          </p>
          <div className="reveal-on-scroll mt-5 flex flex-wrap items-center justify-center gap-4" data-reveal>
            <h2 className="font-[var(--font-display)] text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.9] font-bold tracking-[-0.07em] text-[#111111]">
              When you
            </h2>
            <div className="toggle-pill" role="tablist" aria-label="GlucoTwin usage mode">
              <button
                aria-selected={scenarioMode === 'do'}
                className={scenarioMode === 'do' ? 'is-active' : ''}
                onClick={() => setScenarioMode('do')}
                role="tab"
                type="button"
              >
                do
              </button>
              <button
                aria-selected={scenarioMode === 'dont'}
                className={scenarioMode === 'dont' ? 'is-active' : ''}
                onClick={() => setScenarioMode('dont')}
                role="tab"
                type="button"
              >
                don&apos;t
              </button>
            </div>
            <h2 className="font-[var(--font-display)] text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.9] font-bold tracking-[-0.07em] text-[#111111]">
              use GlucoTwin
            </h2>
          </div>
          <p className="reveal-on-scroll mx-auto mt-8 max-w-[780px] text-[20px] leading-9 text-[#b1b1b1]" data-reveal>
            GlucoTwin turns diabetes decisions into a strategic advantage, pairing adaptive predictions
            with a physiological proof layer before the body carries the risk.
          </p>
        </div>

        <div
          key={scenarioMode}
          className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {scenarioCards[scenarioMode].map((card, index) => (
            <article
              key={card.title}
              className={`surface-card reveal-on-scroll rounded-[30px] p-7 transition duration-300 hover:-translate-y-1 hover:border-black/12 hover:bg-black/[0.03] ${
                scenarioMode === 'dont' ? 'opacity-78' : ''
              }`}
              data-reveal
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <span className={`feature-icon ${scenarioMode === 'do' ? 'feature-icon--positive' : 'feature-icon--negative'}`}>
                <Glyph kind={scenarioMode === 'do' ? 'check' : 'cross'} />
              </span>
              <h3 className="mt-7 text-[31px] leading-[1.05] font-bold tracking-[-0.04em] text-[#111111]">
                {card.title}
              </h3>
              <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-slate-600">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1500px] px-4 pb-22 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[860px] text-center">
          <p className="section-kicker reveal-on-scroll" data-reveal>
            5 STAGES · ZERO GUESSWORK
          </p>
          <h2
            className="reveal-on-scroll mt-5 font-[var(--font-display)] text-[clamp(2.9rem,7vw,5.2rem)] leading-[0.92] font-bold tracking-[-0.06em] text-[#111111]"
            data-reveal
          >
            How we work
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {workStages.map((stage, index) => (
            <article
              key={stage.number}
              className="surface-card reveal-on-scroll stage-card rounded-[28px] p-7"
              data-reveal
              style={
                {
                  '--card-accent': stage.accent,
                  transitionDelay: `${index * 90}ms`,
                } as CSSProperties
              }
            >
              <p className="stage-card-number">{stage.number}</p>
              <span className="stage-card-badge">{stage.badge}</span>
              <h3 className="mt-7 text-[22px] leading-[1.15] font-bold tracking-[-0.04em] text-[#111111]">
                {stage.title}
              </h3>
              <p className="mt-4 text-[15px] leading-7 text-slate-650">{stage.copy}</p>
              <p className="mt-8 font-[var(--font-mono)] text-[12px] tracking-[0.18em] text-slate-500 uppercase">
                {stage.footer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-[1500px] px-4 pb-22 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[980px] text-center">
          <p className="section-kicker reveal-on-scroll" data-reveal>
            SPECIALIZED AI MODULES
          </p>
          <h2
            className="reveal-on-scroll mt-5 font-[var(--font-display)] text-[clamp(3rem,7vw,5.5rem)] leading-[0.92] font-bold tracking-[-0.07em] text-[#111111]"
            data-reveal
          >
            Core capabilities
          </h2>
          <p className="reveal-on-scroll mt-5 font-[var(--font-mono)] text-[12px] tracking-[0.24em] text-slate-500 uppercase" data-reveal>
            AI + PHYSIOLOGICAL GATE
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {capabilities.map((card, index) => (
            <article
              key={card.title}
              className="surface-card reveal-on-scroll capability-card rounded-[30px] p-8"
              data-reveal
              style={
                {
                  '--card-accent': card.accent,
                  transitionDelay: `${index * 70}ms`,
                } as CSSProperties
              }
            >
              <div className="flex items-start justify-between gap-5">
                <span className="capability-icon">
                  <Glyph kind={card.kind} />
                </span>
                <span className="font-[var(--font-mono)] text-[11px] tracking-[0.2em] text-slate-500 uppercase">
                  {card.label}
                </span>
              </div>
              <h3 className="mt-10 text-[38px] leading-[1.02] font-bold tracking-[-0.05em] text-[#111111]">
                {card.title}
              </h3>
              <p className="mt-5 max-w-[540px] text-[16px] leading-7 text-slate-600">{card.copy}</p>
              <div className="mt-8 border-t border-black/8 pt-6">
                <p className="font-[var(--font-mono)] text-[11px] tracking-[0.2em] text-slate-500 uppercase">
                  Key roles
                </p>
                <p className="mt-4 text-[15px] leading-7 text-slate-700">{card.roles}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="results" className="mx-auto max-w-[1500px] px-4 pb-22 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[820px] text-center">
          <p className="section-kicker reveal-on-scroll" data-reveal>
            REPORT METRICS
          </p>
          <h2
            className="reveal-on-scroll mt-5 font-[var(--font-display)] text-[clamp(2.9rem,6vw,5.1rem)] leading-[0.94] font-bold tracking-[-0.06em] text-[#111111]"
            data-reveal
          >
            Results that support the architecture
          </h2>
          <p className="reveal-on-scroll mx-auto mt-7 max-w-[780px] text-[18px] leading-8 text-slate-600" data-reveal>
            These numbers come directly from the GlucoTwin project report, with the zero severe-hypo
            acceptance result acting as the clearest validation of the safety-gate concept.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resultsCards.map((card, index) => (
            <article
              key={card.label}
              className="surface-card reveal-on-scroll rounded-[28px] p-8"
              data-reveal
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <p className="font-[var(--font-mono)] text-[11px] tracking-[0.2em] text-slate-500 uppercase">
                Report metric
              </p>
              <p className="mt-8 font-[var(--font-display)] text-[clamp(3.2rem,6vw,4.8rem)] leading-none font-bold tracking-[-0.07em] text-[#111111]">
                <AnimatedValue
                  active={resultsVisible}
                  decimals={card.decimals}
                  reducedMotion={prefersReducedMotion}
                  suffix={card.suffix}
                  value={card.value}
                />
              </p>
              <p className="mt-5 max-w-[280px] text-[15px] leading-7 text-slate-600">{card.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-[1500px] px-4 pb-22 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div className="reveal-on-scroll" data-reveal>
            <p className="text-[15px] text-slate-500">What people say</p>
            <h2 className="mt-4 font-[var(--font-serif)] text-[clamp(3.2rem,6vw,5.2rem)] leading-[0.88] font-semibold tracking-[-0.04em] text-[#111111]">
              Testimonials
            </h2>
          </div>
          <div className="reveal-on-scroll lg:justify-self-end" data-reveal>
            <p className="max-w-[560px] text-[18px] leading-8 text-slate-600">
              Patients and clinicians respond to simulation-backed support because it replaces
              guesswork with a clearer rehearsal of risk, timing, and safer alternatives.
            </p>
            <p className="mt-4 text-[13px] leading-6 text-slate-500">
              Representative concept statements used to communicate the intended experience, not
              clinical evidence.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className="surface-card reveal-on-scroll rounded-[28px] p-8"
              data-reveal
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <p className="text-[18px] leading-9 text-[#171717]">“{item.quote}”</p>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#161616] text-[22px] font-bold text-[#f0f0f0]">
                  {item.initial}
                </div>
                <div>
                  <p className="text-[20px] font-bold tracking-[-0.03em] text-[#111111]">
                    {item.name}
                    <span className="ml-2 text-[#111111]">✓</span>
                  </p>
                  <p className="mt-1 text-[14px] text-slate-500">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1280px] px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[840px] text-center">
          <p className="section-kicker reveal-on-scroll" data-reveal>
            FREQUENTLY ASKED
          </p>
          <h2
            className="reveal-on-scroll mt-5 font-[var(--font-display)] text-[clamp(2.9rem,6vw,5rem)] leading-[0.94] font-bold tracking-[-0.06em] text-[#111111]"
            data-reveal
          >
            Common questions
          </h2>
        </div>

        <div className="mt-14 space-y-5">
          {faqs.map((item, index) => {
            const isOpen = openFaq === index

            return (
              <article
                key={item.question}
                className={`faq-card reveal-on-scroll ${isOpen ? 'is-open' : ''}`}
                data-reveal
                style={{ transitionDelay: `${index * 45}ms` }}
              >
                <button
                  aria-expanded={isOpen}
                  className="faq-trigger"
                  onClick={() => setOpenFaq((current) => (current === index ? -1 : index))}
                  type="button"
                >
                  <span>{item.question}</span>
                  <span className={`faq-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
                    ˅
                  </span>
                </button>
                {isOpen ? <p className="faq-answer">{item.answer}</p> : null}
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-24 sm:px-6 lg:px-8">
        <div className="surface-card reveal-on-scroll rounded-[34px] px-8 py-10 text-center sm:px-10 sm:py-12" data-reveal>
          <p className="section-kicker">RESEARCH-FIRST PLATFORM</p>
          <h2 className="mx-auto mt-5 max-w-[880px] font-[var(--font-display)] text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.94] font-bold tracking-[-0.06em] text-[#111111]">
            Start with a safer design language for diabetes decisions.
          </h2>
          <p className="mx-auto mt-7 max-w-[820px] text-[18px] leading-8 text-slate-600">
            This first frontend pass turns the GlucoTwin report into a premium landing experience while
            keeping the product claims anchored to the research constraints you already documented.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link className="cta-primary" to="/create-account">
              Create account
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="cta-secondary" to="/login">
              Open app
            </Link>
          </div>

          {/* Clinical Security and Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-6 border-t border-slate-200/60 pt-8 text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            <div className="flex items-center gap-2">
              <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              HIPAA Compliant
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              GDPR Compliant
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <svg className="size-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              SOC2 Type II Security
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-2">
              <svg className="size-4 text-[#2455e8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              FDA Research Use Only
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-[980px] text-[13px] leading-7 text-slate-500">
            Disclaimer: GlucoTwin is presented here as a research and simulation-based decision-support
            system. It is not a clinically approved insulin dosing device and should not be treated as a
            replacement for professional medical care.
          </p>
        </div>
      </section>
    </main>
  )
}

