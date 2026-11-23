import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { motion } from 'motion/react'
import { Ellipsis, type LucideIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { springSnappy } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { barItems, isActivePath, isMoreActive, moreItems } from './nav-items'

function TabInner({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon
  label: string
  active: boolean
}) {
  return (
    <>
      {active && (
        <motion.span
          layoutId="bottom-nav-pill"
          transition={springSnappy}
          className="bg-primary/12 absolute inset-x-2 top-1.5 h-8 rounded-full"
        />
      )}
      <Icon className="relative size-5" strokeWidth={active ? 2.4 : 2} />
      <span className="relative text-[11px] font-medium">{label}</span>
    </>
  )
}

const tabClass = (active: boolean) =>
  cn(
    'relative flex h-16 flex-1 flex-col items-center justify-center gap-1 transition-[color,transform] duration-150 active:scale-95 motion-reduce:active:scale-100',
    active ? 'text-primary' : 'text-muted-foreground',
  )

/** Phone navigation: 4 tabs plus a More sheet (Split, Nutrition, Profile). */
export function BottomNav() {
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreActive = isMoreActive(pathname)

  return (
    <nav
      aria-label="Main"
      className="bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-lg">
        {barItems.map((item) => {
          const active = isActivePath(pathname, item.to)
          return (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={tabClass(active)}>
              <TabInner icon={item.icon} label={item.label} active={active} />
            </NavLink>
          )
        })}
        <button
          type="button"
          className={tabClass(moreActive)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(true)}
        >
          <TabInner icon={Ellipsis} label="More" active={moreActive} />
        </button>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="gap-0">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
            <SheetDescription className="sr-only">Other sections of Pluto</SheetDescription>
          </SheetHeader>
          <ul className="grid gap-1 px-2">
            {moreItems.map(({ to, label, icon: Icon }) => {
              const active = isActivePath(pathname, to)
              return (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex h-14 items-center gap-4 rounded-xl px-4 text-base font-medium transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'hover:bg-accent',
                    )}
                  >
                    <Icon className="size-5" />
                    {label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
