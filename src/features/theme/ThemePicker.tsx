import { motion } from 'motion/react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { springSnappy } from '@/lib/motion'
import type { ThemePref } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { useThemeStore } from './theme-store'

const options: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

/** Segmented control for the settings screen. */
export function ThemePicker() {
  const pref = useThemeStore((s) => s.pref)
  const setPref = useThemeStore((s) => s.setPref)

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="bg-muted grid grid-cols-3 gap-1 rounded-xl p-1"
    >
      {options.map(({ value, label, icon: Icon }) => {
        const selected = pref === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setPref(value)}
            className={cn(
              'relative flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {selected && (
              <motion.span
                layoutId="theme-picker-thumb"
                transition={springSnappy}
                className="bg-background absolute inset-0 rounded-lg shadow-sm"
              />
            )}
            <Icon className="relative size-4" />
            <span className="relative">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
