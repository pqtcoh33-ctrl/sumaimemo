// app/management/dashboard/settings/tenants/page.tsx
import { redirect } from 'next/navigation'
import TenantsClient from './TenantsClient'

export default async function TenantsPage() {
  let profile: { management_company_id: string; role: string } | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: { cookie: '' }, // 必要に応じて Cookie を渡す
      cache: 'no-store', // build 時キャッシュを避ける
    })

    if (!res.ok) throw new Error('profile fetch failed')
    const json = await res.json()
    profile = json.profile
  } catch (err) {
    console.error('profile fetch error:', err)
    redirect('/dashboard')
  }

  if (!profile || profile.role !== 'management') {
    redirect('/dashboard')
  }

  return <TenantsClient managementCompanyId={profile.management_company_id} />
}
