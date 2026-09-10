import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlaskConical, Search, ChevronDown,
  Droplets, Wind, Thermometer, Clock, Leaf, FileText,
} from 'lucide-react'
import { recommendSchema, RecommendFormValues } from '@/utils/validators'
import { useFoodProfiles } from '@/hooks/useKnowledgeBase'
import { FoodProfile } from '@/api/materials'
import SliderInput from '@/components/ui/SliderInput'
import SelectInput from '@/components/ui/SelectInput'
import NeonButton from '@/components/ui/NeonButton'
import GlassCard from '@/components/ui/GlassCard'
import Tooltip from '@/components/ui/Tooltip'
import { cn } from '@/utils/formatters'

interface FoodInputFormProps {
  onSubmit: (values: RecommendFormValues) => void
  loading: boolean
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
  { value: 'other', label: 'Other' },
]

const SUSTAINABILITY_OPTIONS = [
  { value: 'none', label: 'None', desc: 'No preference' },
  { value: 'low', label: 'Low', desc: 'Slightly preferred' },
  { value: 'medium', label: 'Medium', desc: 'Important consideration' },
  { value: 'high', label: 'High', desc: 'Top priority' },
]

const SLIDER_DESCRIPTIONS = {
  moisture: 'How sensitive is the product to moisture? High = needs strong moisture barrier.',
  oxygen: 'How sensitive is the product to oxygen? High = needs strong oxygen barrier.',
  temp: 'Required storage/processing temperature range.',
  shelf: 'How many days must the packaging preserve the product?',
}

export default function FoodInputForm({ onSubmit, loading }: FoodInputFormProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [query, setQuery] = useState('')
  const suggestionRef = useRef<HTMLDivElement>(null)

  const { profiles, search } = useFoodProfiles()

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecommendFormValues>({
    resolver: zodResolver(recommendSchema),
    defaultValues: {
      food_commodity: '',
      moisture_sensitivity: 5,
      oxygen_sensitivity: 5,
      temperature_min: 2,
      temperature_max: 25,
      shelf_life_days: 30,
      sustainability_preference: 'none',
    },
  })

  const sustainabilityValue = watch('sustainability_preference')

  // Autocomplete search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= 2) {
        search(query)
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, search])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const applyProfile = (profile: FoodProfile) => {
    setValue('food_commodity', profile.commodity)
    setValue('food_category', profile.category as RecommendFormValues['food_category'])
    setValue('moisture_sensitivity', profile.moisture_sensitivity)
    setValue('oxygen_sensitivity', profile.oxygen_sensitivity)
    setValue('temperature_min', profile.temperature_min)
    setValue('temperature_max', profile.temperature_max)
    setValue('shelf_life_days', profile.shelf_life_days)
    if (profile.sustainability_preference) {
      setValue(
        'sustainability_preference',
        profile.sustainability_preference as RecommendFormValues['sustainability_preference']
      )
    }
    setQuery(profile.commodity)
    setShowSuggestions(false)
  }

  const handleFormSubmit = (values: RecommendFormValues) => {
    onSubmit(values)
  }

  const filteredProfiles = profiles.filter((p) =>
    p.commodity.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Food Commodity */}
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-neon-cyan" />
          Food Commodity
        </h3>

        <div className="relative" ref={suggestionRef}>
          <Controller
            name="food_commodity"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                value={query || field.value}
                onChange={(e) => {
                  const v = e.target.value
                  setQuery(v)
                  field.onChange(v)
                }}
                placeholder="e.g. Fresh Tomatoes, Ground Coffee, Frozen Pizza..."
                className={cn(
                  'w-full px-4 py-3 rounded-xl text-sm',
                  'bg-white/5 border text-text-primary',
                  'placeholder:text-text-secondary/40',
                  'focus:outline-none focus:ring-1 transition-all duration-200',
                  errors.food_commodity
                    ? 'border-neon-red/50 focus:ring-neon-red/20'
                    : 'border-white/10 focus:border-neon-cyan/40 focus:ring-neon-cyan/20'
                )}
              />
            )}
          />

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && filteredProfiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 top-full mt-1 w-full glass-strong rounded-xl border border-white/10 overflow-hidden shadow-glass"
              >
                {filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => applyProfile(profile)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-text-primary">{profile.commodity}</span>
                    <span className="text-xs text-text-secondary/60 group-hover:text-neon-cyan transition-colors">
                      {profile.category.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {errors.food_commodity && (
            <p className="mt-1 text-xs text-neon-red">{errors.food_commodity.message}</p>
          )}
        </div>

        <Controller
          name="food_category"
          control={control}
          render={({ field }) => (
            <SelectInput
              label="Category (optional)"
              value={field.value || ''}
              options={CATEGORY_OPTIONS}
              onChange={field.onChange}
              placeholder="Select category..."
              className="mt-4"
            />
          )}
        />
      </GlassCard>

      {/* Barrier Properties */}
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-5 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-neon-violet" />
          Barrier Requirements
        </h3>

        <div className="space-y-6">
          <Controller
            name="moisture_sensitivity"
            control={control}
            render={({ field }) => (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Droplets className="w-4 h-4 text-neon-cyan" />
                  <Tooltip content={SLIDER_DESCRIPTIONS.moisture}>
                    <span className="text-sm font-medium text-text-primary">Moisture Sensitivity</span>
                  </Tooltip>
                </div>
                <SliderInput
                  label=""
                  value={field.value}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={field.onChange}
                  color="cyan"
                  formatValue={(v) => v === 0 ? 'None' : v <= 3 ? `${v} Low` : v <= 6 ? `${v} Medium` : `${v} High`}
                />
              </div>
            )}
          />

          <Controller
            name="oxygen_sensitivity"
            control={control}
            render={({ field }) => (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Wind className="w-4 h-4 text-neon-violet" />
                  <Tooltip content={SLIDER_DESCRIPTIONS.oxygen}>
                    <span className="text-sm font-medium text-text-primary">Oxygen Sensitivity</span>
                  </Tooltip>
                </div>
                <SliderInput
                  label=""
                  value={field.value}
                  min={0}
                  max={10}
                  step={0.5}
                  onChange={field.onChange}
                  color="violet"
                  formatValue={(v) => v === 0 ? 'None' : v <= 3 ? `${v} Low` : v <= 6 ? `${v} Medium` : `${v} High`}
                />
              </div>
            )}
          />
        </div>
      </GlassCard>

      {/* Temperature & Shelf Life */}
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-5 flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-neon-amber" />
          Storage Conditions
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Tooltip content={SLIDER_DESCRIPTIONS.temp}>
                <span className="text-sm font-medium text-text-primary">Temperature Range</span>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="temperature_min"
                control={control}
                render={({ field }) => (
                  <SliderInput
                    label="Min"
                    value={field.value}
                    min={-40}
                    max={100}
                    step={1}
                    unit="°C"
                    onChange={field.onChange}
                    color="cyan"
                  />
                )}
              />
              <Controller
                name="temperature_max"
                control={control}
                render={({ field }) => (
                  <SliderInput
                    label="Max"
                    value={field.value}
                    min={-40}
                    max={200}
                    step={1}
                    unit="°C"
                    onChange={field.onChange}
                    color="amber"
                  />
                )}
              />
            </div>
            {errors.temperature_max && (
              <p className="mt-1 text-xs text-neon-red">{errors.temperature_max.message}</p>
            )}
          </div>

          <Controller
            name="shelf_life_days"
            control={control}
            render={({ field }) => (
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-4 h-4 text-neon-green" />
                  <Tooltip content={SLIDER_DESCRIPTIONS.shelf}>
                    <span className="text-sm font-medium text-text-primary">Required Shelf Life</span>
                  </Tooltip>
                </div>
                <SliderInput
                  label=""
                  value={field.value}
                  min={1}
                  max={1825}
                  step={1}
                  onChange={field.onChange}
                  color="green"
                  formatValue={(v) => {
                    if (v >= 365) return `${(v / 365).toFixed(1)}y`
                    if (v >= 30) return `${Math.round(v / 30)}mo`
                    return `${v}d`
                  }}
                />
                {errors.shelf_life_days && (
                  <p className="mt-1 text-xs text-neon-red">{errors.shelf_life_days.message}</p>
                )}
              </div>
            )}
          />
        </div>
      </GlassCard>

      {/* Sustainability */}
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-neon-green" />
          Sustainability Preference
        </h3>
        <Controller
          name="sustainability_preference"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUSTAINABILITY_OPTIONS.map((opt) => {
                const isSelected = field.value === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 px-3 py-3 rounded-xl border text-xs transition-all duration-200',
                      isSelected
                        ? 'bg-neon-green/10 border-neon-green/40 text-neon-green'
                        : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/8 hover:text-text-primary'
                    )}
                  >
                    <span className="font-semibold">{opt.label}</span>
                    <span className="opacity-70 text-center leading-tight">{opt.desc}</span>
                  </button>
                )
              })}
            </div>
          )}
        />
      </GlassCard>

      {/* Special Requirements */}
      <GlassCard className="p-5">
        <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-text-secondary" />
          Special Requirements
          <span className="text-xs text-text-secondary/50 font-normal">(optional)</span>
        </h3>
        <Controller
          name="special_requirements"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              placeholder="e.g. MAP compatible, child-resistant closure, microwave safe, allergen barrier..."
              className={cn(
                'w-full px-4 py-3 rounded-xl text-sm resize-none',
                'bg-white/5 border border-white/10',
                'text-text-primary placeholder:text-text-secondary/40',
                'focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20',
                'transition-all duration-200'
              )}
              maxLength={1000}
            />
          )}
        />
        {errors.special_requirements && (
          <p className="mt-1 text-xs text-neon-red">{errors.special_requirements.message}</p>
        )}
      </GlassCard>

      {/* Submit */}
      <NeonButton
        type="submit"
        variant="cyan"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        <FlaskConical className="w-5 h-5" />
        {loading ? 'Analyzing...' : 'Analyze Packaging'}
      </NeonButton>
    </form>
  )
}
