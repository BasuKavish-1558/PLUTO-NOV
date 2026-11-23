import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validated environment, or null when Supabase isn't configured yet
 * (Phase 0 runs without a Supabase project).
 */
export function readEnv(source: Record<string, unknown> = import.meta.env): Env | null {
  const parsed = envSchema.safeParse(source)
  return parsed.success ? parsed.data : null
}
