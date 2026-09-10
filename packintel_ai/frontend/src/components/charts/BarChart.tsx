import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'
import { getScoreLabel } from '@/utils/constants'

interface BarChartProps {
  data: Array<{ name: string; value: number }>
  height?: number
  showLabels?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { color } = getScoreLabel(payload[0]?.value)
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs border border-white/10">
        <p className="text-text-secondary mb-1">{label}</p>
        <p className="font-mono font-bold" style={{ color }}>
          {payload[0]?.value?.toFixed(1)}/100
        </p>
      </div>
    )
  }
  return null
}

export default function BarChartComponent({
  data,
  height = 200,
  showLabels = true,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={showLabels ? 110 : 0}
          tick={{ fill: '#8B95B0', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={18}>
          {data.map((entry) => {
            const { color } = getScoreLabel(entry.value)
            return (
              <Cell
                key={entry.name}
                fill={color}
                style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
              />
            )
          })}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  )
}
