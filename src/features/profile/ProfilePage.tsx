import { CircleUser } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemePicker } from '@/features/theme/ThemePicker'

export function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" />
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemePicker />
          </CardContent>
        </Card>
        <ComingSoon
          icon={CircleUser}
          title="Your profile"
          description="Name, photo, age, body vitals, units and sign out. Arrives in Phase 1."
        />
      </div>
    </>
  )
}
