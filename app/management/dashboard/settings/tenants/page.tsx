// app/management/dashboard/settings/tenants/page.tsx

import { getProfile } from '@/lib/auth/getProfile'
import { redirect } from 'next/navigation'
import { getProperties } from './actions'
import TenantsClient from './TenantsClient'

// 🔴 認証・cookies を使うため Node.js 実行を明示
export const runtime = 'nodejs'

// 🔴 build 時の静的評価を完全に禁止
export const dynamic = 'force-dynamic'

export default async function TenantsPage() {
  try {
    // ✅ 設計どおり、最初に必ず認証を通す
    const { profile } = await getProfile()

    // ✅ 権限ガード（既存設計そのまま）
    if (!profile || profile.role !== 'management') {
      redirect('/dashboard')
    }

    // ✅ 認証後にデータ取得
    const properties = await getProperties(profile.management_company_id)

    return <TenantsClient properties={properties} />
  } catch (err) {
    /**
     * build フェーズや想定外例外用のフォールバック
     * （実行時にここへ来る設計ではない）
     */
    console.error('[TenantsPage fallback]', err)
    return <TenantsClient properties={[]} />
  }
}
