import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { Avatar } from '@/features/profile/Avatar'
import { useProfile } from '@/features/profile/profile-context'
import { cn } from '@/lib/utils'

/** Page title. On phones it also carries the Profile button (the user's photo) at the top left. */
export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  const { avatar_path, display_name } = useProfile()
  return (
    <header className="mb-6 flex min-h-11 items-center gap-3">
      <NavLink
        to="/profile"
        aria-label="Profile"
        className={({ isActive }) =>
          cn(
            'rounded-full transition-transform duration-150 active:scale-95 motion-reduce:active:scale-100 md:hidden',
            isActive && 'ring-primary ring-offset-background ring-2 ring-offset-2',
          )
        }
      >
        <Avatar path={avatar_path} name={display_name} />
      </NavLink>
      <h1 className="flex-1 text-2xl font-semibold tracking-tight">{title}</h1>
      {action}
    </header>
  )
}
