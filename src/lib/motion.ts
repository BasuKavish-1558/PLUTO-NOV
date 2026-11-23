import type { Transition } from 'motion/react'

/** Shared springs so motion feels consistent (roughly 150-300 ms). */
export const springSnappy: Transition = { type: 'spring', stiffness: 500, damping: 35, mass: 0.6 }
export const springSoft: Transition = { type: 'spring', stiffness: 300, damping: 30 }
export const fadeFast: Transition = { duration: 0.15, ease: 'easeOut' }
