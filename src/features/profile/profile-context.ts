import { createContext, useContext } from 'react'
import type { Profile } from '@/data/models'

export const ProfileContext = createContext<Profile | null>(null)

/** The signed-in user's profile. Available on every screen behind the profile gate. */
export function useProfile(): Profile {
  const profile = useContext(ProfileContext)
  if (!profile) throw new Error('useProfile() used outside the profile gate')
  return profile
}

export function useUnits() {
  const { weight_unit, height_unit } = useProfile()
  return { weightUnit: weight_unit, heightUnit: height_unit }
}
