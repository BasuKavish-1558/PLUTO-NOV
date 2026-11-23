import type { ReactNode } from 'react'
import { motion } from 'motion/react'

/** Animated circular progress (e.g. protein consumed vs goal). value is 0-1. */
export function ProgressRing({
  value,
  size = 112,
  stroke = 10,
  label,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  label: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const clamped = Math.min(Math.max(value, 0), 1)

  return (
    <div
      role="img"
      aria-label={label}
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: clamped, opacity: clamped === 0 ? 0 : 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
