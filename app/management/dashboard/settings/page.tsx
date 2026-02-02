import { getProfile } from '@/lib/auth/getProfile'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ManagementSettingsPage() {
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    redirect('/dashboard')
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <h1>設定</h1>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {/* 入居者招待 */}
        <li style={{ marginBottom: 8 }}>
          <Link
            href="/management/dashboard/settings/invite"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            入居者招待
          </Link>
        </li>

        {/* 入居者一覧 */}
        <li style={{ marginBottom: 8 }}>
          <Link
            href="/management/dashboard/settings/tenants"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            入居者一覧
          </Link>
        </li>

        {/* お知らせ新規作成 */}
        <li style={{ marginBottom: 8 }}>
          <Link
            href="/management/dashboard/settings/notices/create"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
          お知らせ作成
          </Link>
        </li>

        {/* 書類アップロード追加 */}
        <li style={{ marginBottom: 8 }}>
          <Link
            href="/management/dashboard/settings/documents"
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            書類アップロード
          </Link>
        </li>
      </ul>
    </div>
  )
}
