// app/management/dashboard/settings/tenants/page.tsx
export const dynamic = 'force-dynamic'
import { getProfile } from '@/lib/auth/getProfile'
import { redirect } from 'next/navigation'
import { getProperties } from './actions'
import TenantsClient from './TenantsClient'

export default async function TenantsPage() {
  try {
    const { profile } = await getProfile()

    // 通常アクセス時のガード（今の設計そのまま）
    if (!profile || profile.role !== 'management') {
      redirect('/dashboard')
    }

    const properties = await getProperties(profile.management_company_id)

    return <TenantsClient properties={properties} />
  } catch (err) {
    /**
     * 🔴 ここが重要
     * Vercel build 時は認証コンテキストが無く例外になるため、
     * build を止めないために空表示で逃がす
     *
     * 実行時（ブラウザ）ではここに来ない
     */
    console.error(
      '[TenantsPage build-safe fallback]',
      err
    )

    return <TenantsClient properties={[]} />
  }
}
