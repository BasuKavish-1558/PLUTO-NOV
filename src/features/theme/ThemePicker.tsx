import { Monitor, Moon, Sun } from 'lucide-react'
import { SegmentedControl } from '@/components/SegmentedControl'
import type { ThemePref } from '@/lib/theme'
import { chooseTheme } from './choose-theme'
import { useThemeStore } from './theme-store'

const options = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const satisfies readonly { value: ThemePref; label: string; icon: typeof Sun }[]

/** Theme setting: System, Light or Dark. */
export function ThemePicker() {
  const pref = useThemeStore((s) => s.pref)
  return <SegmentedControl label="Theme" value={pref} onChange={chooseTheme} options={options} />
}
