// lib/management/getDocumentsStats.ts
import { createSupabaseServer } from '@/lib/supabase/server'

export type DocumentRow = {
  id: string
  title: string
  file_path: string
  created_at: string
  property_id: string
  signedUrl: string | null
}

export async function getDocumentsStats(propertyIds: string[]) {
  const supabase = await createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('management_company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'management') return []

  let query = supabase
    .from('documents')
    .select('id, title, file_path, created_at, property_id')
    .eq('management_company_id', profile.management_company_id)
    .order('created_at', { ascending: false })

  if (propertyIds.length > 0) {
    query = query.in('property_id', propertyIds)
  }

  const { data: documents } = await query
  if (!documents) return []

  return await Promise.all(
    documents.map(async (doc) => {
      const { data } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 60 * 5)

      return {
        ...doc,
        signedUrl: data?.signedUrl ?? null,
      }
    })
  )
}
