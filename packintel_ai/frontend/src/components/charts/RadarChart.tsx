import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarChartProps {
  data: Array<{ subject: string; value: number; fullMark: number }>
  color?: string
  size?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs font-mono border border-white/10">
        <p className="text-text-primary font-semibold">{payload[0]?.payload?.subject}</p>
        <p style={{ color: payload[0]?.color }}>
          {payload[0]?.value?.toFixed(1)}/100
        </p>
      </div>
    )
  }
  return null
}

export default function RadarChartComponent({
  data,
  color = '#00D4FF',
  size = 260,
}: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={size}>
      <RechartsRadar data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid
          stroke="rgba(255,255,255,0.06)"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#8B95B0', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.12}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RechartsRadar>
    </ResponsiveContainer>
  )
}
