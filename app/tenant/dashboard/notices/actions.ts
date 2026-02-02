'use server'

import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'

type TenantNotice = {
  id: string
  title: string
  created_at: string
  is_read: boolean
}

export async function getTenantNoticesWithRead(): Promise<TenantNotice[]> {
  /* =========================
     認証・ロールチェック
     ========================= */
  const { user, profile } = await getProfile()

  if (!user || !profile || profile.role !== 'tenant') {
    throw new Error('unauthorized')
  }

  /* =========================
     Service Role Supabase
     ========================= */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /* =========================
     tenant の所属物件を取得
     ========================= */
  const { data: invite, error: inviteError } = await admin
    .from('tenant_invites')
    .select('property_id')
    .eq('tenant_user_id', user.id)
    .not('used_at', 'is', null)
    .single()

  if (inviteError || !invite?.property_id) {
    return []
  }

  /* =========================
     notices 一覧 + 既読 JOIN
     ========================= */
  const { data, error } = await admin
    .from('notices')
    .select(`
      id,
      title,
      created_at,
      tenant_notice_reads (
        id
      )
    `)
    .eq('property_id', invite.property_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error || !data) {
    throw error
  }

  /* =========================
     整形
     ========================= */
  return data.map(n => ({
    id: n.id,
    title: n.title,
    created_at: n.created_at,
    is_read: Array.isArray(n.tenant_notice_reads) && n.tenant_notice_reads.length > 0,
  }))
}
