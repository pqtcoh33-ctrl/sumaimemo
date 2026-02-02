import { createSupabaseServer } from '@/lib/supabase/server'

export async function getManagementProperties() {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('management_company_id, role')
    .eq('user_id', user.id)
    .single()

  // ★ ここが重要：throw しない
  if (
    profileError ||
    !profile ||
    profile.role !== 'management' ||
    !profile.management_company_id
  ) {
    return []
  }

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, name')
    .eq('management_company_id', profile.management_company_id)
    .order('name')

  if (error) return []

  return properties
}
