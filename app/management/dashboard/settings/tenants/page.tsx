// app/management/dashboard/settings/tenants/page.tsx
import { getProfile } from '@/lib/auth/getProfile'
import { redirect } from 'next/navigation'
import { getProperties } from './actions'
import TenantsClient from './TenantsClient'

export default async function TenantsPage() {
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    redirect('/dashboard')
  }

  const properties = await getProperties(profile.management_company_id)

  return <TenantsClient properties={properties} />
}
