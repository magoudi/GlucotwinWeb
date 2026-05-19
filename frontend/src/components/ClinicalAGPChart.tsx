import { useMemo, useState } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts'

export function ClinicalAGPChart() {
  // Generate realistic AGP data (24 hours * 4 points per hour = 96 points)
  const realisticData = useMemo(() => {
    const data = []
    const baseCurve = [
      110, 105, 100, 95, 95, 105, 130, // 0-6 AM: Dawn phenomenon dip then rise
      145, 135, 125, 120, // 7-10 AM: Post breakfast
      135, 145, 135, 120, // 11-2 PM: Lunch
      115, 110, 115, 125, // 3-6 PM: Afternoon
      145, 155, 140, 125, 115 // 7-11 PM: Dinner and bed
    ]
    
    // Interpolate to 96 points
    for (let i = 0; i < 96; i++) {
      const hour = Math.floor(i / 4)
      const nextHour = (hour + 1) % 24
      const ratio = (i % 4) / 4
      
      const medianVal = baseCurve[hour] + (baseCurve[nextHour] - baseCurve[hour]) * ratio
      
      // Add natural biological variance
      const variance = Math.sin(i / 3) * 5
      const median = Math.round(medianVal + variance)
      
      // Calculate IQR bands (wider after meals, tighter at night)
      const isMealTime = (hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)
      const spread = isMealTime ? 35 : 15
      
      data.push({
        time: `${String(hour).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
        hour: hour,
        median: median,
        // For Recharts Area, we use an array [bottom, top]
        iqr: [median - spread + Math.random() * 5, median + spread + Math.random() * 5]
      })
    }
    return data
  }, [])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const median = payload.find((p: any) => p.dataKey === 'median')?.value
      const iqr = payload.find((p: any) => p.dataKey === 'iqr')?.value
      return (
        <div className="rounded-xl border border-white/10 bg-[#0B1120]/90 px-3 py-2 text-right backdrop-blur-md shadow-xl z-50">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{payload[0].payload.time}</p>
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-sm font-extrabold text-[#22d3ee]">Median: {median} mg/dL</p>
            <p className="text-xs font-bold text-slate-400">25th-75th: {Math.round(iqr[0])}-{Math.round(iqr[1])} mg/dL</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1120]/40 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.3)] backdrop-blur-sm mb-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Ambulatory Glucose Profile</h3>
          <p className="text-xs text-slate-400 font-bold">14-Day Simulation Overlay</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
          <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-[#22d3ee]/20 border border-[#22d3ee]/30" /> 25th-75th %</div>
          <div className="flex items-center gap-1.5"><div className="h-0.5 w-3 bg-[#22d3ee]" /> Median</div>
        </div>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={realisticData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="hour" 
              type="number"
              domain={[0, 23]}
              tickCount={5}
              ticks={[0, 6, 12, 18, 23]}
              tickFormatter={(val) => {
                if (val === 0 || val === 23) return '12 AM'
                if (val === 6) return '6 AM'
                if (val === 12) return '12 PM'
                if (val === 18) return '6 PM'
                return ''
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
              dy={10}
            />
            <YAxis 
              domain={[40, 220]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
              width={35}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* Target Range Background */}
            <ReferenceArea y1={70} y2={180} fill="rgba(37,194,160,0.04)" />
            <ReferenceLine y={180} stroke="rgba(37,194,160,0.2)" strokeDasharray="4 4" />
            <ReferenceLine y={70} stroke="rgba(244,63,94,0.2)" strokeDasharray="4 4" />

            {/* IQR Area */}
            <Area 
              type="monotone" 
              dataKey="iqr" 
              stroke="none" 
              fill="rgba(34,211,238,0.15)" 
              isAnimationActive={true}
              animationDuration={1500}
            />
            
            {/* Median Line */}
            <Line 
              type="monotone" 
              dataKey="median" 
              stroke="#22d3ee" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 4, fill: '#0B1120', stroke: '#22d3ee', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
