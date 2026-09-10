import { motion } from 'framer-motion'
import { Droplets, Wind, Thermometer, Clock, Leaf } from 'lucide-react'
import { RecommendRequest } from '@/types/recommendation'
import SliderInput from '@/components/ui/SliderInput'
import SelectInput from '@/components/ui/SelectInput'
import GlassCard from '@/components/ui/GlassCard'

interface ConditionSlidersProps {
  conditions: Partial<RecommendRequest>
  onChange: (field: keyof RecommendRequest, value: any) => void
  title: string
  icon?: React.ReactNode
}

const CATEGORY_OPTIONS = [
  { value: 'fresh_produce', label: 'Fresh Produce' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'meat', label: 'Meat & Seafood' },
  { value: 'frozen', label: 'Frozen Foods' },
  { value: 'dry_goods', label: 'Dry Goods' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'processed', label: 'Processed Foods' },
]

const SUSTAINABILITY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function ConditionSliders({
  conditions,
  onChange,
  title,
  icon,
}: ConditionSlidersProps) {
  return (
    <GlassCard className="p-5">
      <h3 className="font-display font-semibold text-text-primary mb-5 flex items-center gap-2">
        {icon}
        {title}
      </h3>

      <div className="space-y-5">
        {/* Food Commodity */}
        <div>
          <input
            type="text"
            value={(conditions.food_commodity as string) || ''}
            onChange={(e) => onChange('food_commodity', e.target.value)}
            placeholder="Food product name..."
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
          />
        </div>

        {/* Moisture */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Droplets className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-medium text-text-primary">Moisture Sensitivity</span>
          </div>
          <SliderInput
            label=""
            value={(conditions.moisture_sensitivity as number) || 5}
            min={0}
            max={10}
            step={0.5}
            onChange={(v) => onChange('moisture_sensitivity', v)}
            color="cyan"
            formatValue={(v) => v === 0 ? 'None' : v <= 3 ? `${v} Low` : v <= 6 ? `${v} Med` : `${v} High`}
          />
        </div>

        {/* Oxygen */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Wind className="w-4 h-4 text-neon-violet" />
            <span className="text-sm font-medium text-text-primary">Oxygen Sensitivity</span>
          </div>
          <SliderInput
            label=""
            value={(conditions.oxygen_sensitivity as number) || 5}
            min={0}
            max={10}
            step={0.5}
            onChange={(v) => onChange('oxygen_sensitivity', v)}
            color="violet"
            formatValue={(v) => v === 0 ? 'None' : v <= 3 ? `${v} Low` : v <= 6 ? `${v} Med` : `${v} High`}
          />
        </div>

        {/* Temperature Range */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Thermometer className="w-4 h-4 text-neon-amber" />
            <span className="text-sm font-medium text-text-primary">Temperature (°C)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SliderInput
              label="Min"
              value={(conditions.temperature_min as number) || 2}
              min={-40}
              max={100}
              step={1}
              unit="°C"
              onChange={(v) => onChange('temperature_min', v)}
              color="cyan"
            />
            <SliderInput
              label="Max"
              value={(conditions.temperature_max as number) || 25}
              min={-40}
              max={200}
              step={1}
              unit="°C"
              onChange={(v) => onChange('temperature_max', v)}
              color="amber"
            />
          </div>
        </div>

        {/* Shelf Life */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Clock className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-medium text-text-primary">Shelf Life</span>
          </div>
          <SliderInput
            label=""
            value={(conditions.shelf_life_days as number) || 30}
            min={1}
            max={1825}
            step={1}
            onChange={(v) => onChange('shelf_life_days', v)}
            color="green"
            formatValue={(v) => {
              if (v >= 365) return `${(v / 365).toFixed(1)}y`
              if (v >= 30) return `${Math.round(v / 30)}mo`
              return `${v}d`
            }}
          />
        </div>

        {/* Sustainability */}
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Leaf className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-medium text-text-primary">Sustainability</span>
          </div>
          <SelectInput
            label=""
            value={(conditions.sustainability_preference as string) || 'none'}
            options={SUSTAINABILITY_OPTIONS}
            onChange={(v) => onChange('sustainability_preference', v)}
          />
        </div>
      </div>
    </GlassCard>
  )
}
