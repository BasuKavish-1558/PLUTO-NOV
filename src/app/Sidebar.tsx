import { NavLink, useLocation } from 'react-router'
import { motion } from 'motion/react'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { springSnappy } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { isActivePath, navItems } from './nav-items'

/** Tablet and desktop navigation with all seven sections. */
export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r px-3 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-3">
        <span className="bg-primary size-6 rounded-full" aria-hidden />
        <span className="text-lg font-semibold tracking-tight">Pluto</span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = isActivePath(pathname, to)
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={cn(
                'relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-pill"
                  transition={springSnappy}
                  className="bg-primary/10 absolute inset-0 rounded-xl"
                />
              )}
              <Icon className="relative size-5" />
              <span className="relative">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      <ThemeToggle className="self-start" />
    </aside>
  )
}
