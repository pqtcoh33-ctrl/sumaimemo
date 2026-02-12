'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/getProfile'
import { revalidatePath } from 'next/cache'
import { sendNoticeMail } from '@/lib/mail/sendNoticeMail'
import { createClient } from '@supabase/supabase-js'

export async function createNotice(params: {
  title: string
  body: string
  propertyId?: string | null
  sendMail?: boolean // ← 追加（任意）
}) {
  const supabase = await createSupabaseServer()
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    throw new Error('権限がありません')
  }

  /* =========================
     ① お知らせ作成（既存ロジックそのまま）
     ========================= */
  const { error } = await supabase.from('notices').insert({
    title: params.title,
    body: params.body,
    property_id: params.propertyId ?? null,
    management_company_id: profile.management_company_id,
  })

  if (error) throw error

  /* =========================
     ② メール送信（チェックONのときだけ）
     ========================= */
  if (params.sendMail && params.propertyId) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profiles, error: profilesError } = await admin
      .from('profiles')
      .select('email')
      .eq('property_id', params.propertyId)
      .eq('role', 'tenant')
      .not('email', 'is', null)

    if (profilesError) throw profilesError

    const emails = profiles.map(p => p.email!)

    if (emails.length > 0) {
      await sendNoticeMail(emails)
    }
  }

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

  if (error) throw error

  revalidatePath('/management/dashboard/notices')
}
