import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'
import ReadNotice from './ReadNotice'

export default async function TenantNoticeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { profile, user } = await getProfile()

  if (!user || !profile || profile.role !== 'tenant') {
    redirect('/login')
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /* =========================
     お知らせ取得（物件ガード付き）
     ========================= */
  const { data: notice, error } = await admin
    .from('notices')
    .select('id, title, body, created_at')
    .eq('id', params.id)
    .eq('is_published', true)
    .single()

  if (error || !notice) {
    return (
      <div style={{ padding: 24 }}>
        <h1>お知らせ</h1>
        <p>お知らせが見つかりません。</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      {/* マウントされた瞬間に既読 */}
      <ReadNotice noticeId={notice.id} />

      <h1 style={{ marginBottom: 16 }}>{notice.title}</h1>

      <div style={{ whiteSpace: 'pre-wrap', marginBottom: 24 }}>
        {notice.body}
      </div>

      <small style={{ color: '#999' }}>
        {new Date(notice.created_at).toLocaleDateString()}
      </small>
    </div>
  )
}
