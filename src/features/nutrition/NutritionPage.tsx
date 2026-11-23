import { Drumstick } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'

export function NutritionPage() {
  return (
    <>
      <PageHeader title="Nutrition" />
      <ComingSoon
        icon={Drumstick}
        title="Nutrition"
        description="Your daily protein goal, quick-add entries and history. Arrives in Phase 1."
      />
    </>
  )
}
