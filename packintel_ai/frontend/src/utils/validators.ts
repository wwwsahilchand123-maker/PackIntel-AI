import { z } from 'zod'

export const recommendSchema = z
  .object({
    food_commodity: z
      .string()
      .min(2, 'Food commodity must be at least 2 characters')
      .max(200, 'Food commodity must be under 200 characters'),
    food_category: z
      .enum([
        'fresh_produce', 'dairy', 'bakery', 'meat', 'frozen',
        'dry_goods', 'beverages', 'processed', 'other',
      ])
      .optional(),
    moisture_sensitivity: z
      .number()
      .min(0, 'Minimum 0')
      .max(10, 'Maximum 10'),
    oxygen_sensitivity: z
      .number()
      .min(0, 'Minimum 0')
      .max(10, 'Maximum 10'),
    temperature_min: z
      .number()
      .min(-40, 'Minimum -40°C')
      .max(200, 'Maximum 200°C'),
    temperature_max: z
      .number()
      .min(-40, 'Minimum -40°C')
      .max(200, 'Maximum 200°C'),
    humidity_min: z.number().min(0).max(100).optional(),
    humidity_max: z.number().min(0).max(100).optional(),
    shelf_life_days: z
      .number()
      .int('Must be a whole number')
      .min(1, 'Minimum 1 day')
      .max(3650, 'Maximum 10 years'),
    sustainability_preference: z.enum(['none', 'low', 'medium', 'high']),
    special_requirements: z
      .string()
      .max(1000, 'Maximum 1000 characters')
      .optional(),
  })
  .refine((d) => d.temperature_max > d.temperature_min, {
    message: 'Maximum temperature must be greater than minimum',
    path: ['temperature_max'],
  })

export type RecommendFormValues = z.infer<typeof recommendSchema>
