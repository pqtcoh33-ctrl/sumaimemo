import { createSupabaseServer } from '@/lib/supabase/server'

export async function getInquiries() {
  const supabase = await createSupabaseServer()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('management_company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'management') return []

  const { data, error } = await supabase
    .from('inquiries')
    .select('id, category, body, status, created_at')
    .eq('management_company_id', profile.management_company_id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
