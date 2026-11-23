import { CalendarDays } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'

export function CalendarPage() {
  return (
    <>
      <PageHeader title="Calendar" />
      <ComingSoon
        icon={CalendarDays}
        title="Calendar"
        description="A month of training days at a glance, with your streak, day logs and photos. Arrives in Phase 1."
      />
    </>
  )
}
