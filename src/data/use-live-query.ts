import { useEffect, useState } from 'react'
import { liveQuery } from 'dexie'

/**
 * Subscribes to a Dexie query and re-renders when the data changes
 * (local writes and sync both update Dexie). Uses Dexie's built-in liveQuery.
 */
export function useLiveQuery<T>(query: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<{ data: T | undefined; isLoading: boolean }>({
    data: undefined,
    isLoading: true,
  })

  useEffect(() => {
    const sub = liveQuery(query).subscribe({
      next: (data) => setState({ data, isLoading: false }),
      error: (error: unknown) => console.error('[liveQuery]', error),
    })
    return () => sub.unsubscribe()
    // The caller lists the query's inputs in deps, like useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
