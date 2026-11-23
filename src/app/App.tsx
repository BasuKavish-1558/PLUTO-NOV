import { MotionConfig } from 'motion/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { isSupabaseConfigured } from '@/data/supabase'
import { AuthListener } from '@/features/auth/AuthListener'
import { ThemeSync } from '@/features/theme/ThemeSync'
import { PwaPrompt } from './PwaPrompt'
import { router } from './router'
import { SetupScreen } from './SetupScreen'

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
        {isSupabaseConfigured() ? (
          <>
            <AuthListener />
            <RouterProvider router={router} />
          </>
        ) : (
          <SetupScreen />
        )}
        <PwaPrompt />
      </MotionConfig>
    </QueryClientProvider>
  )
}
