import { cn } from '@/utils/formatters'

interface Option {
  value: string
  label: string
}

interface SelectInputProps {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SelectInput({
  label,
  value,
  options,
  onChange,
  placeholder,
  className,
}: SelectInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl text-sm',
          'bg-white/5 border border-white/10',
          'text-text-primary',
          'focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/20',
          'transition-all duration-200',
          'appearance-none cursor-pointer'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238B95B0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#0a0f1e] text-text-primary"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
