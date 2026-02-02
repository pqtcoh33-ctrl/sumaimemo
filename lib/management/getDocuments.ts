import { createSupabaseServer } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/getProfile'

export async function getDocuments() {
  const supabase = createSupabaseServer()
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    return []
  }

  const { data, error } = await supabase
    .from('documents')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }

  return data
}
