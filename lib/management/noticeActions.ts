'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/getProfile'
import { revalidatePath } from 'next/cache'

/* =========================
   お知らせ作成
   ========================= */
export async function createNotice(params: {
  title: string
  body: string
  propertyId?: string | null
}) {
  const supabase = await createSupabaseServer()
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    throw new Error('権限がありません')
  }

  const { error } = await supabase.from('notices').insert({
    title: params.title,
    body: params.body,
    property_id: params.propertyId ?? null,
    management_company_id: profile.management_company_id,
  })

  if (error) throw error

  revalidatePath('/management/dashboard/notices')
}

/* =========================
   お知らせ更新
   ========================= */
export async function updateNotice(params: {
  id: string
  title: string
  body: string
}) {
  const supabase = await createSupabaseServer()
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    throw new Error('権限がありません')
  }

  const { error } = await supabase
    .from('notices')
    .update({
      title: params.title,
      body: params.body,
    })
    .eq('id', params.id)
    .eq('management_company_id', profile.management_company_id)

  if (error) throw error

  revalidatePath('/management/dashboard/notices')
}

/* =========================
   お知らせ削除（★重要）
   ========================= */
export async function deleteNotice(noticeId: string) {
  const supabase = await createSupabaseServer()
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    throw new Error('権限がありません')
  }

  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', noticeId)
    .eq('management_company_id', profile.management_company_id)

  if (error) throw error

  // ★ redirect はしない
  revalidatePath('/management/dashboard/notices')
}
