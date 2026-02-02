// app/(management)/dashboard/settings/notices/create/page.tsx
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth/getProfile'
import { getManagementProperties } from '@/lib/management/getManagementProperties'
import NoticeCreateForm from '@/components/dashboard/NoticeCreateForm'
import DashboardBackLink from '@/components/management/DashboardBackLink'

export default async function CreateNoticePage() {
  /* =========================
     認可
     ========================= */
  const { profile } = await getProfile()
  if (!profile || profile.role !== 'management') {
    redirect('/dashboard')
  }

  /* =========================
     管理会社の物件取得
     ========================= */
  const properties = await getManagementProperties()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <DashboardBackLink />
      <h1 style={{ marginBottom: 16 }}>お知らせ作成</h1>

      <p style={{ color: '#666', marginBottom: 16 }}>
        物件を選択し、タイトルと本文を入力してお知らせを作成します。
      </p>

      <NoticeCreateForm properties={properties} />
    </div>
  )
}
