import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { springSnappy } from '@/lib/motion'
import { toggledTheme } from '@/lib/theme'
import { useThemeStore } from './theme-store'
import { useResolvedTheme } from './use-resolved-theme'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useResolvedTheme()
  const setPref = useThemeStore((s) => s.setPref)
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={label}
      title={label}
      onClick={() => setPref(toggledTheme(theme))}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
          transition={springSnappy}
          className="flex"
        >
          {theme === 'dark' ? <Moon /> : <Sun />}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}
