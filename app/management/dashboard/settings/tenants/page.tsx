// app/management/dashboard/settings/tenants/page.tsx

import { getProfile } from '@/lib/auth/getProfile'
import { redirect } from 'next/navigation'
import { getProperties } from './actions'
import TenantsClient from './TenantsClient'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function TenantsPage() {
  // 🔴 build フェーズでは一切触らない
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    return <TenantsClient properties={[]} />
  }

  // ===== 実行時だけ =====
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    redirect('/dashboard')
  }

  const properties = await getProperties(profile.management_company_id)

  return <TenantsClient properties={properties} />
}
