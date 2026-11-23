import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { CircleUser } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Page title. On phones it also carries the Profile button at the top left. */
export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex min-h-11 items-center gap-3">
      <NavLink
        to="/profile"
        aria-label="Profile"
        className={({ isActive }) =>
          cn(
            'bg-muted text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-full transition-[transform,color] duration-150 active:scale-95 motion-reduce:active:scale-100 md:hidden',
            isActive && 'bg-primary/12 text-primary ring-primary ring-2',
          )
        }
      >
        {/* Replaced by the profile photo in Phase 1. */}
        <CircleUser className="size-6" />
      </NavLink>
      <h1 className="flex-1 text-2xl font-semibold tracking-tight">{title}</h1>
      {action}
    </header>
  )
}
