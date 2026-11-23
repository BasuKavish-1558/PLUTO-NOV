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
        description="Your streak, days trained this month, and the full log and photos for any day. Arrives in Phase 1."
      />
    </>
  )
}
