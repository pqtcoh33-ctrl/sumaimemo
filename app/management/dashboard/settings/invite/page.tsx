// app/management/dashboard/settings/invite/page.tsx
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth/getProfile'
import { getManagementProperties } from '@/lib/management/getManagementProperties'
import InviteCreateForm from './InviteCreateForm'
import DashboardBackLink from '@/components/management/DashboardBackLink'

export default async function InvitePage() {
  const { profile, user } = await getProfile()

  if (!user || !profile || profile.role !== 'management') {
    redirect('/dashboard')
  }

  const properties = await getManagementProperties()
  const defaultProperty = properties[0]?.id ?? ''
  const initialToken = null

  return (
    <div style={{ maxWidth: 720, padding: 16 }}>
      <DashboardBackLink />
      <h1>入居者招待</h1>

      <p style={{ color: '#666' }}>
        物件と部屋番号を指定して、入居者用の招待リンクを作成します。
      </p>

      <InviteCreateForm
        properties={properties}
        defaultProperty={defaultProperty}
        initialToken={initialToken}
      />
    </div>
  )
}
