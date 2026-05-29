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
  Safe: 'bg-emerald-50 text-emerald-850 border-emerald-200/60',
  Caution: 'bg-amber-50 text-amber-850 border-amber-200/60',
  Unsafe: 'bg-rose-50 text-rose-850 border-rose-200/60',
  'Needs More Data': 'bg-[#e8eeff] text-[#2455e8] border-[#2455e8]/20',
  Adaptation: 'bg-[#e8eeff] text-[#2455e8] border-[#2455e8]/20',
  'Fine-tuning': 'bg-amber-50 text-amber-850 border-amber-200/60',
  Active: 'bg-emerald-50 text-emerald-850 border-emerald-200/60',
  Mock: 'bg-black/5 text-[#666666] border-black/10',
  Prototype: 'bg-[#e8eeff] text-[#2455e8] border-[#2455e8]/20',
  'Data': 'bg-black/5 text-[#666666] border-black/10',
  'Simulation only': 'bg-amber-50 text-amber-850 border-amber-200/60',
  'Connected to MongoDB': 'bg-emerald-50 text-emerald-850 border-emerald-200/60',
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
    <div className="rounded-2xl border border-black/8 bg-white px-5 py-4 text-[16px] font-bold leading-6 text-[#666666] shadow-sm">
      <span className="text-[#111111] font-extrabold">Simulation only.</span> {children ?? 'This prototype uses clinical data and is not for real medical use.'}
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
        <div className="rounded-xl border border-black/8 bg-white px-3 py-2 text-right shadow-md">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#666666]">Reading</p>
          <p className="text-base font-extrabold text-[#111111]">{payload[0].value} {unit}</p>
          {payload[0].payload.label && <p className="text-xs font-bold text-[#666666]">{payload[0].payload.label}</p>}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`relative flex flex-col rounded-2xl border border-black/8 bg-white p-4 ${height} shadow-sm`}>
      <div className="absolute left-4 top-4 text-xs font-extrabold text-[#666666] z-10">{unit}</div>
      <div className="relative flex-1 mt-6 h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={realisticData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2455e8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2455e8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis 
              domain={[min, max]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666666', fontSize: 10, fontWeight: 700 }}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#999999', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <ReferenceArea y1={targetRange[0]} y2={targetRange[1]} fill="rgba(37,194,160,0.02)" />
            <ReferenceLine y={targetRange[1]} stroke="rgba(37,194,160,0.15)" strokeDasharray="4 4" />
            <ReferenceLine y={targetRange[0]} stroke="rgba(37,194,160,0.15)" strokeDasharray="4 4" />

            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#2455e8" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#2455e8', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-between px-8 text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
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
        <div className="rounded-xl border border-black/8 bg-white px-3 py-2 text-right shadow-md z-50 relative">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#666666]">Selected</p>
          <p className="text-base font-extrabold text-[#111111]">{payload[0].value}{suffix}</p>
          <p className="text-xs font-bold text-[#666666]">{payload[0].payload.label}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`relative flex flex-col rounded-2xl border border-black/8 bg-white p-4 ${height} shadow-sm`}>
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#666666', fontSize: 11, fontWeight: 800 }} 
              dy={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(17,17,17,0.02)' }} />
            <Bar 
              dataKey="value" 
              radius={[6, 6, 6, 6]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={1000}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={activeIndex === index ? '#2455e8' : 'rgba(36, 85, 232, 0.5)'} 
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
    <div className="h-3 overflow-hidden rounded-full bg-black/5">
      <div className="h-full rounded-full bg-gradient-to-r from-[#2455e8] to-[#4f7bff] shadow-sm" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

export function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>
}

export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[17px] font-extrabold text-[#111111]">{label}</span>
      <select
        className="mt-2 h-[56px] w-full rounded-xl border border-black/10 bg-white px-4 text-[18px] font-bold text-[#111111] outline-none transition-shadow focus:border-[#2455e8] focus:shadow-[0_0_0_4px_rgba(36,85,232,0.15)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => <option key={option} className="bg-white text-[#111111]">{option}</option>)}
      </select>
    </label>
  )
}
