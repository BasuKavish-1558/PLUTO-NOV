import { useId } from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { springSnappy } from '@/lib/motion'
import { cn } from '@/lib/utils'

export type SegmentOption<T extends string> = { value: T; label: string; icon?: LucideIcon }

/** Radio-style segmented control with a sliding thumb. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: readonly SegmentOption<T>[]
  label: string
  className?: string
}) {
  const id = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('bg-muted grid auto-cols-fr grid-flow-col gap-1 rounded-xl p-1', className)}
    >
      {options.map(({ value: v, label: text, icon: Icon }) => {
        const selected = v === value
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className={cn(
              'relative flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
              selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {selected && (
              <motion.span
                layoutId={`segment-thumb-${id}`}
                transition={springSnappy}
                className="bg-background absolute inset-0 rounded-lg shadow-sm"
              />
            )}
            {Icon && <Icon className="relative size-4" />}
            <span className="relative">{text}</span>
          </button>
        )
      })}
    </div>
  )
}
