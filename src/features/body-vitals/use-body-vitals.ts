import { bodyVitalsQuery } from '@/data/repos/body-vitals'
import { useLiveQuery } from '@/data/use-live-query'
import { useUserId } from '@/features/auth/auth-store'

/** All body-vital entries of the signed-in user, live from Dexie. */
export function useBodyVitals() {
  const userId = useUserId()
  return useLiveQuery(bodyVitalsQuery(userId), [userId]).data ?? []
}
