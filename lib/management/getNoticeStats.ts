// lib/management/getNoticeStats.ts
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

type NoticeStat = {
  id: string
  title: string
  created_at: string
  read: number
  total: number
}

export async function getNoticeStats(
  propertyIds?: string[]
): Promise<NoticeStat[]> {
  /* =========================
     user client（認証用）
     ========================= */
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  /* =========================
     管理会社 profile 確認（user権限）
     ========================= */
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('management_company_id, role')
    .eq('user_id', user.id)
    .single()

  if (
    profileError ||
    !profile ||
    profile.role !== 'management' ||
    !profile.management_company_id
  ) {
    return []
  }

  /* =========================
     admin client（集計専用）
     ========================= */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /* =========================
     notices 取得（admin）
     ========================= */
  let noticeQuery = admin
    .from('notices')
    .select('id, title, created_at, property_id')
    .eq('management_company_id', profile.management_company_id)
    .order('created_at', { ascending: false })

  if (propertyIds && propertyIds.length > 0) {
    noticeQuery = noticeQuery.in('property_id', propertyIds)
  }

  const { data: notices, error: noticeError } = await noticeQuery

  if (noticeError || !notices || notices.length === 0) {
    return []
  }

  const noticeIds = notices.map((n) => n.id)

  /* =========================
     母数（tenant 数）（admin）
     ========================= */
  let tenantQuery = admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'tenant')
    .eq('management_company_id', profile.management_company_id)

  if (propertyIds && propertyIds.length > 0) {
    tenantQuery = tenantQuery.in('property_id', propertyIds)
  }

  const { count: totalTenants } = await tenantQuery
  const total = totalTenants ?? 0

  /* =========================
     既読数（admin）
     ========================= */
  const { data: reads } = await admin
    .from('tenant_notice_reads')
    .select('notice_id')
    .in('notice_id', noticeIds)

  const readMap = new Map<string, number>()
  ;(reads ?? []).forEach((r) => {
    readMap.set(r.notice_id, (readMap.get(r.notice_id) ?? 0) + 1)
  })

  /* =========================
     組み立て
     ========================= */
  return notices.map((n) => ({
    id: n.id,
    title: n.title,
    created_at: n.created_at,
    read: readMap.get(n.id) ?? 0,
    total,
  }))
}
