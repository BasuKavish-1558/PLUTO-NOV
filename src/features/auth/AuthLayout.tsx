import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { springSoft } from '@/lib/motion'

/** Centered, single-column layout for sign-in, sign-up and onboarding screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-[max(2rem,env(safe-area-inset-top))]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex items-center gap-2">
          <span className="bg-primary size-7 rounded-full" aria-hidden />
          <span className="text-lg font-semibold tracking-tight">Pluto</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  )
}
