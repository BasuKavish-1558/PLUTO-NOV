import { House } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'

export function HomePage() {
  return (
    <>
      <PageHeader title="Today" />
      <ComingSoon
        icon={House}
        title="Today"
        description="Today's workout from your active split, your protein ring and your streak. Arrives in Phase 1."
      />
    </>
  )
}
