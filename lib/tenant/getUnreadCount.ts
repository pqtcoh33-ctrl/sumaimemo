import { createSupabaseServer } from '@/lib/supabase/server'

export async function getUnreadCount() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data: profile } = await supabase
    .from('profiles')
    .select('management_company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'tenant') return 0

  const { data: notices } = await supabase
    .from('notices')
    .select('id')
    .eq('management_company_id', profile.management_company_id)

  if (!notices || notices.length === 0) return 0

  const ids = notices.map(n => n.id)
  const { data: reads } = await supabase
    .from('notice_reads')
    .select('notice_id')
    .eq('tenant_user_id', user.id)

  const readSet = new Set((reads ?? []).map(r => r.notice_id))
  return ids.filter(id => !readSet.has(id)).length
}
