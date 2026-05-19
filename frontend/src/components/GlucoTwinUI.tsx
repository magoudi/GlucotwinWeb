import { type ReactNode, useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts'
import { type SafetyStatus } from '../data/mockPatientData'

type BadgeTone = SafetyStatus | 'Adaptation' | 'Fine-tuning' | 'Active' | 'Mock' | 'Prototype' | 'Data' | 'Simulation only' | 'Connected to MongoDB'

const badgeStyles: Record<string, string> = {
  Safe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Caution: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Unsafe: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Needs More Data': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Adaptation: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Fine-tuning': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Mock: 'bg-white/5 text-slate-300 border-white/10',
  Prototype: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Data': 'bg-white/5 text-slate-300 border-white/10',
  'Simulation only': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Connected to MongoDB': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export function StatusBadge({ status }: { status: BadgeTone | string }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-extrabold ${badgeStyles[status] ?? badgeStyles.Mock}`}>
      {status}
    </span>
  )
}

export function PrototypeNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-[16px] font-bold leading-6 text-slate-300 backdrop-blur shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
      <span className="text-white">Simulation only.</span> {children ?? 'This prototype uses clinical data and is not for real medical use.'}
    </div>
  )
}

export function MiniLineChart({ data, height = 'h-64', targetRange = [70, 180], unit = 'mg/dL' }: { data: Array<{ label: string; value: number }>; height?: string; targetRange?: [number, number]; unit?: string }) {
  // Generate a slightly noisier, realistic curve if there are only a few points
  const realisticData = useMemo(() => {
    if (data.length === 0) return []
    if (data.length > 20) return data // Already detailed
    
    // Interpolate points to make it look like a continuous monitor
    const detailed = []
    for (let i = 0; i < data.length - 1; i++) {
      const p1 = data[i]
      const p2 = data[i + 1]
      detailed.push(p1)
      // Add 3 intermediate points with slight noise
      for (let j = 1; j <= 3; j++) {
        const ratio = j / 4
        const interpolatedValue = p1.value + (p2.value - p1.value) * ratio
        const noise = (Math.random() - 0.5) * 8 // +/- 4 mg/dL noise
        detailed.push({
          label: '',
          value: Math.round(interpolatedValue + noise)
        })
      }
    }
    detailed.push(data[data.length - 1])
    return detailed
  }, [data])

  const values = realisticData.map(d => d.value)
  const min = Math.max(0, Math.min(...values, targetRange[0]) - 20)
  const max = Math.max(...values, targetRange[1]) + 20

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-[#0B1120]/90 px-3 py-2 text-right backdrop-blur-md shadow-xl">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Reading</p>
          <p className="text-base font-extrabold text-white">{payload[0].value} {unit}</p>
          {payload[0].payload.label && <p className="text-xs font-bold text-slate-400">{payload[0].payload.label}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`relative flex flex-col rounded-2xl border border-white/10 bg-[#0B1120]/40 backdrop-blur-sm p-4 ${height}`}>
      <div className="absolute left-4 top-4 text-xs font-extrabold text-slate-500 z-10">{unit}</div>
      <div className="relative flex-1 mt-6 h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={realisticData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#25c2a0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#25c2a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis 
              domain={[min, max]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <ReferenceArea y1={targetRange[0]} y2={targetRange[1]} fill="rgba(37,194,160,0.06)" />
            <ReferenceLine y={targetRange[1]} stroke="rgba(37,194,160,0.3)" strokeDasharray="4 4" />
            <ReferenceLine y={targetRange[0]} stroke="rgba(37,194,160,0.3)" strokeDasharray="4 4" />

            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#25c2a0" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 6, fill: '#0B1120', stroke: '#25c2a0', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-between px-8 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
        {data.map((point) => <span key={point.label}>{point.label}</span>)}
      </div>
    </div>
  )
}

export function BarChart({ data, suffix = '', height = 'h-56' }: { data: Array<{ label: string; value: number }>; suffix?: string; height?: string }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-[#0B1120]/90 px-3 py-2 text-right backdrop-blur-md shadow-xl z-50 relative">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Selected</p>
          <p className="text-base font-extrabold text-white">{payload[0].value}{suffix}</p>
          <p className="text-xs font-bold text-slate-400">{payload[0].payload.label}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`relative flex flex-col rounded-2xl border border-white/10 bg-[#0B1120]/40 backdrop-blur-sm p-4 ${height}`}>
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }} 
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 6, 6]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={activeIndex === index ? '#25c2a0' : '#3b82f6'} 
                  fillOpacity={activeIndex === index ? 1 : 0.6}
                  className="transition-all duration-300"
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_10px_rgba(37,194,160,0.5)]" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>
}

export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[17px] font-extrabold text-slate-300">{label}</span>
      <select
        className="mt-2 h-[56px] w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[18px] font-bold text-white outline-none transition-shadow focus:border-cyan-500 focus:shadow-[0_0_0_4px_rgba(37,194,160,0.2)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => <option key={option} className="bg-[#0B1120]">{option}</option>)}
      </select>
    </label>
  )
}
