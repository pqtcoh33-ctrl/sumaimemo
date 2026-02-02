import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'
import NoticesClient from './NoticesClient'

type Notice = {
  id: string
  title: string
  body: string
  created_at: string
  tenant_notice_reads?: {
    tenant_user_id: string
  }[]
}

type TenantProfileRow = {
  property_id: string
}

export default async function TenantNoticesPage() {
  /* =========================
     UI ガード
     ========================= */
  const { profile, user } = await getProfile()

  if (!user || !profile || profile.role !== 'tenant') {
    redirect('/login')
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /* =========================
     tenant の所属物件
     ========================= */
  const { data: tenantProfile, error: profileError } = await admin
    .from('profiles')
    .select('property_id')
    .eq('user_id', user.id)
    .eq('role', 'tenant')
    .maybeSingle<TenantProfileRow>()

  if (profileError || !tenantProfile?.property_id) {
    return (
      <div style={{ padding: 16 }}>
        <h1>お知らせ</h1>
        <p>入居情報が取得できませんでした。</p>
      </div>
    )
  }

  /* =========================
     notices + 既読
     ========================= */
  const { data: notices, error } = await admin
    .from('notices')
    .select(`
      id,
      title,
      body,
      created_at,
      tenant_notice_reads (
        tenant_user_id
      )
    `)
    .eq('property_id', tenantProfile.property_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <h1>お知らせ</h1>
        <p>お知らせの取得に失敗しました。</p>
      </div>
    )
  }

  /* =========================
     UI用に整形
     ========================= */
  const uiNotices =
    notices?.map((n: Notice) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      created_at: n.created_at,
      isUnread:
        !n.tenant_notice_reads ||
        !n.tenant_notice_reads.some(
          (r) => r.tenant_user_id === user.id
        ),
    })) ?? []

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>お知らせ一覧</h1>
      <NoticesClient notices={uiNotices} />
    </div>
  )
}
