import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth/getProfile'
import NoticeEditClient from './NoticeEditClient'

type Props = {
  params: { id: string }
}

export default async function NoticeEditPage({ params }: Props) {
  const { profile } = await getProfile()
  if (!profile || profile.role !== 'management') {
    redirect('/login')
  }

  const supabase = await createSupabaseServer()

  const { data: notice } = await supabase
    .from('notices')
    .select('id, title, body')
    .eq('id', params.id)
    .eq('management_company_id', profile.management_company_id)
    .single()

  // 🔹 削除直後の再評価でここに来ないようにする
  if (!notice) {
    redirect('/management/dashboard/notices')
  }

  return (
    <NoticeEditClient
      noticeId={notice.id}
      initialTitle={notice.title}
      initialBody={notice.body}
    />
  )
}
