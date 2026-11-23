import { ChartLine } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'

export function ProgressPage() {
  return (
    <>
      <PageHeader title="Progress" />
      <ComingSoon
        icon={ChartLine}
        title="Progress"
        description="Body weight history arrives in Phase 1. Exercise charts and your PR list arrive in Phase 2."
      />
    </>
  )
}
