import { useState } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { springSoft } from '@/lib/motion'

/** Keeps the old page on screen while it animates out. */
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

export function AnimatedOutlet() {
  const { pathname } = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: springSoft }}
        exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
      >
        <FrozenOutlet />
      </motion.div>
    </AnimatePresence>
  )
}
