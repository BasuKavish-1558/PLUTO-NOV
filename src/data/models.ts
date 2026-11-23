import { z } from 'zod'

/**
 * Local row shapes. Rows coming from Supabase are validated with these schemas,
 * which also narrow the text columns the database constrains with CHECKs.
 */
export const profileSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  avatar_path: z.string().nullable(),
  age: z.number().int().nullable(),
  weight_unit: z.enum(['kg', 'lb']),
  height_unit: z.enum(['cm', 'ft_in']),
  theme_pref: z.enum(['system', 'light', 'dark']),
  show_bmi: z.boolean(),
  onboarded_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Profile = z.infer<typeof profileSchema>

/** Fields the app may change on a profile. */
export type ProfilePatch = Partial<
  Pick<
    Profile,
    | 'display_name'
    | 'avatar_path'
    | 'age'
    | 'weight_unit'
    | 'height_unit'
    | 'theme_pref'
    | 'show_bmi'
    | 'onboarded_at'
  >
>

const numeric = z.coerce.number()

export const bodyVitalSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  measured_on: z.string(),
  weight_kg: numeric.nullable(),
  height_cm: numeric.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type BodyVital = z.infer<typeof bodyVitalSchema>

export const tombstoneSchema = z.object({
  table_name: z.string(),
  row_id: z.string(),
  deleted_at: z.string(),
})
export type Tombstone = z.infer<typeof tombstoneSchema>
