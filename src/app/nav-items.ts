import {
  CalendarDays,
  ChartLine,
  CircleUser,
  Drumstick,
  Dumbbell,
  House,
  ListChecks,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  /** On phones: shown on the bottom bar, or tucked under "More". */
  placement: 'bar' | 'more'
}

// Order is the sidebar order on tablet and desktop.
export const navItems: readonly NavItem[] = [
  { to: '/', label: 'Home', icon: House, placement: 'bar' },
  { to: '/workout', label: 'Workout', icon: Dumbbell, placement: 'bar' },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, placement: 'bar' },
  { to: '/progress', label: 'Progress', icon: ChartLine, placement: 'bar' },
  { to: '/split', label: 'Split', icon: ListChecks, placement: 'more' },
  { to: '/nutrition', label: 'Nutrition', icon: Drumstick, placement: 'more' },
  { to: '/profile', label: 'Profile', icon: CircleUser, placement: 'more' },
]

export const barItems = navItems.filter((i) => i.placement === 'bar')
export const moreItems = navItems.filter((i) => i.placement === 'more')

/** "/" only matches exactly; other items also match their sub-routes. */
export function isActivePath(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function isMoreActive(pathname: string): boolean {
  return moreItems.some((i) => isActivePath(pathname, i.to))
}

export function titleForPath(pathname: string): string {
  return navItems.find((i) => isActivePath(pathname, i.to))?.label ?? 'Pluto'
}
