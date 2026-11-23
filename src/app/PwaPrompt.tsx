import { AnimatePresence, motion } from 'motion/react'
import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'
import { springSoft } from '@/lib/motion'

/** Shows a small card when a new version is ready; the user decides when to reload. */
export function PwaPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={springSoft}
          className="bg-card fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border p-3 shadow-lg md:bottom-6"
        >
          <RefreshCw className="text-primary size-5 shrink-0" />
          <p className="flex-1 text-sm">A new version of Pluto is ready.</p>
          <Button size="sm" variant="ghost" onClick={() => setNeedRefresh(false)}>
            Later
          </Button>
          <Button size="sm" onClick={() => void updateServiceWorker(true)}>
            Reload
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
