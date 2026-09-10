import { cn } from '@/utils/formatters'

interface SliderInputProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  color?: 'cyan' | 'violet' | 'green' | 'amber'
  description?: string
  formatValue?: (v: number) => string
}

const colorMap = {
  cyan: { accent: '#00D4FF', bg: 'rgba(0,212,255,0.15)' },
  violet: { accent: '#7B2FFF', bg: 'rgba(123,47,255,0.15)' },
  green: { accent: '#00FF9D', bg: 'rgba(0,255,157,0.15)' },
  amber: { accent: '#FFB800', bg: 'rgba(255,184,0,0.15)' },
}

export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  color = 'cyan',
  description,
  formatValue,
}: SliderInputProps) {
  const { accent } = colorMap[color]
  const pct = ((value - min) / (max - min)) * 100

  const displayed = formatValue ? formatValue(value) : `${value}${unit}`

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span
          className="text-sm font-mono font-bold px-2 py-0.5 rounded-lg"
          style={{ color: accent, backgroundColor: `${accent}15` }}
        >
          {displayed}
        </span>
      </div>

      <div className="relative py-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-text-secondary/60 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      {description && (
        <p className="text-xs text-text-secondary/70 leading-relaxed">
          {description}
        </p>
      )}

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${accent};
          cursor: pointer;
          box-shadow: 0 0 8px ${accent}80;
          border: 2px solid rgba(255,255,255,0.2);
          transition: box-shadow 0.2s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          box-shadow: 0 0 14px ${accent};
        }
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${accent};
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  )
}
