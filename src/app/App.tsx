import { MotionConfig } from 'motion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { ThemeSync } from '@/features/theme/ThemeSync'
import { PwaPrompt } from './PwaPrompt'
import { router } from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    // Data is local-first (Dexie); queries refetch on our own invalidation, not on focus.
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, networkMode: 'always' },
    mutations: { networkMode: 'always' },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <ThemeSync />
        <RouterProvider router={router} />
        <PwaPrompt />
      </MotionConfig>
    </QueryClientProvider>
  )
}
