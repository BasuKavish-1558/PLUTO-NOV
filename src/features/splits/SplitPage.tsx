import { ListChecks } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'

export function SplitPage() {
  return (
    <>
      <PageHeader title="Split" />
      <ComingSoon
        icon={ListChecks}
        title="Split"
        description="Pick a preset split or build your own from the exercise library. Arrives in Phase 1."
      />
    </>
  )
}
