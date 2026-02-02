import { createSupabaseServer } from '@/lib/supabase/server'

export async function getTenantNotices() {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // tenant の所属会社を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('management_company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'tenant') return []

  // お知らせ一覧
  const { data: notices, error } = await supabase
    .from('notices')
    .select(`
      id,
      title,
      body,
      created_at,
      notice_reads (
        tenant_user_id
      )
    `)
    .eq('management_company_id', profile.management_company_id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return notices.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    created_at: n.created_at,
    isRead: (n.notice_reads ?? []).some(
      (r: any) => r.tenant_user_id === user.id
    ),
  }))
}
