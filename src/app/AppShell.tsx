import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { AnimatedOutlet } from './AnimatedOutlet'
import { BottomNav } from './BottomNav'
import { titleForPath } from './nav-items'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { pathname } = useLocation()

  useEffect(() => {
    const title = titleForPath(pathname)
    document.title = title === 'Pluto' || title === 'Home' ? 'Pluto' : `${title} · Pluto`
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto w-full max-w-5xl px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8 md:px-8 md:pt-10">
          <AnimatedOutlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
