import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BodyVitalsCard } from '@/features/body-vitals/BodyVitalsCard'
import { ThemePicker } from '@/features/theme/ThemePicker'
import { AccountCard } from './AccountCard'
import { ProfileDetailsCard } from './ProfileDetailsCard'
import { UnitsCard } from './UnitsCard'

export function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-4">
          <ProfileDetailsCard />
          <UnitsCard />
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemePicker />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <BodyVitalsCard />
          <AccountCard />
        </div>
      </div>
    </>
  )
}
