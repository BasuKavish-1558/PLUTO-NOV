import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { ThemeSync } from '@/features/theme/ThemeSync'
import { ThemePicker } from '@/features/theme/ThemePicker'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import '@/styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

createRoot(root).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ThemeSync />
      <main className="mx-auto max-w-md space-y-4 p-4">
        <ThemeToggle />
        <ThemePicker />
      </main>
    </MotionConfig>
  </StrictMode>,
)
