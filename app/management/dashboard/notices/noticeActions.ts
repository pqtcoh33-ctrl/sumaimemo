// app/management/dashboard/notices/actions.ts
'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/getProfile'

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

  if (error) throw new Error(error.message)
}

/* =========================
   お知らせ削除
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

  if (error) throw new Error(error.message)
}
