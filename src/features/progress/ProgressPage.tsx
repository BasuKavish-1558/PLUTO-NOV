import { ChartLine } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBodyVitals } from '@/features/body-vitals/use-body-vitals'
import { WeightHistory } from '@/features/body-vitals/WeightHistory'

export function ProgressPage() {
  const entries = useBodyVitals()
  return (
    <>
      <PageHeader title="Progress" />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Body weight history</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightHistory entries={entries} />
          </CardContent>
        </Card>
        <ComingSoon
          icon={ChartLine}
          title="Charts and PRs"
          description="Weight lifted, volume, estimated 1RM, the body weight chart and your PR list arrive in Phase 2."
        />
      </div>
    </>
  )
}
