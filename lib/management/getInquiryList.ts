import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export type Inquiry = {
  id: string
  property_id: string | null
  status: string
  created_at: string
  category: string | null
  body: string
  unit_label: string | null
}

export async function getInquiryList({
  propertyIds,
  status,
  date,
}: {
  propertyIds: string[]
  status?: string
  date?: string
}) {
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

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = admin
    .from('inquiries')
    .select(`
      id,
      property_id,
      category,
      body,
      status,
      created_at,
      profiles:tenant_id (
        unit_label
      )
    `)
    .eq('management_company_id', profile.management_company_id)
    .order('created_at', { ascending: false })

  if (propertyIds.length > 0) query = query.in('property_id', propertyIds)
  if (status) query = query.eq('status', status)
  if (date) {
    query = query
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`)
  }

  const { data } = await query

  return (
    data?.map((r: any) => ({
      id: r.id,
      property_id: r.property_id,
      status: r.status,
      created_at: r.created_at,
      category: r.category ?? null,
      body: r.body,
      // ★ ここだけが本質的な修正
      unit_label: Array.isArray(r.profiles)
        ? r.profiles[0]?.unit_label ?? null
        : r.profiles?.unit_label ?? null,
    })) ?? []
  )
}
