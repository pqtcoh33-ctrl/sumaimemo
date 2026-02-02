import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'

/* =========================
   型定義
   ========================= */
type Notice = {
  id: string
  title: string
  created_at: string
}

type TenantProfileRow = {
  property_id: string
  unit_label: string | null
  properties:
    | { name: string }
    | { name: string }[]
    | null
}

export default async function TenantDashboardPage() {
  /* =========================
     UIガード
     ========================= */
  const { profile, user } = await getProfile()

  if (!user || !profile || profile.role !== 'tenant') {
    redirect('/login')
  }

  /* =========================
     Service Role Supabase
     ========================= */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /* =========================
     ① 現在の所属情報（profiles）
     ========================= */
  const { data: tenantProfile, error: profileError } = await admin
    .from('profiles')
    .select(`
      property_id,
      unit_label,
      properties (
        name
      )
    `)
    .eq('user_id', user.id)
    .eq('role', 'tenant')
    .maybeSingle<TenantProfileRow>()

  if (
    profileError ||
    !tenantProfile ||
    !tenantProfile.property_id
  ) {
    return (
      <div style={{ padding: 24 }}>
        <h1>入居情報が見つかりません</h1>
        <p>管理会社にお問い合わせください。</p>
      </div>
    )
  }

  /* =========================
     物件名の安全な取得
     ========================= */
  let propertyName = '不明'

  if (Array.isArray(tenantProfile.properties)) {
    propertyName = tenantProfile.properties[0]?.name ?? '不明'
  } else if (
    tenantProfile.properties &&
    'name' in tenantProfile.properties
  ) {
    propertyName = tenantProfile.properties.name
  }

  /* =========================
     ② お知らせ（最新3件）
     ========================= */
  const { data: noticeData } = await admin
    .from('notices')
    .select('id, title, created_at')
    .eq('property_id', tenantProfile.property_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const notices: Notice[] = noticeData ?? []

  /* =========================
     お知らせ総件数（hiddenCount 用）
     ========================= */
  const { count: noticeCount } = await admin
    .from('notices')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', tenantProfile.property_id)
    .eq('is_published', true)

  const hiddenCount = Math.max(
    (noticeCount ?? 0) - notices.length,
    0
  )

  /* =========================
     ③ 問い合わせ状況
     ========================= */
  const { count } = await admin
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_user_id', user.id)
    .in('status', ['new', 'in_progress'])

  const hasOpenInquiry = (count ?? 0) > 0

  /* =========================
     表示（モバイル前提）
     ========================= */
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <header>
        <h1
    style={{
      fontSize: 24,
      fontWeight: 600,
      margin: 0,
      color: '#3176d1',
    }}
  >
    入居者ダッシュボード
  </h1>

        <p style={{ color: '#666', fontSize: 14 }}>
          物件：{propertyName}
          <br />
          部屋番号：
          {tenantProfile.unit_label ?? '不明'}
        </p>
      </header>

      {/* お知らせ */}
      <section>
        <h2 style={{ marginBottom: 8,fontWeight: 500,fontSize: 22, }}>
          最新のお知らせ
        </h2>

        {notices.length === 0 ? (
          <p>現在、お知らせはありません。</p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {notices.map((n) => (
              <div
                key={n.id}
                style={{
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  padding: 12,
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {n.title}
                </div>
                <div
                  style={{
                    color: '#999',
                    fontSize: 12,
                  }}
                >
                  {new Date(
                    n.created_at
                  ).toLocaleDateString()}
                </div>
              </div>
            ))}

            {hiddenCount > 0 && (
              <div
                style={{
                  color: '#999',
                  fontSize: 13,
                }}
              >
                …（他 {hiddenCount} 件）
              </div>
            )}
          </div>
        )}
      </section>

      {/* メニュー */}
      <section>
        <h2 style={{marginBottom: 8,fontWeight: 500,fontSize: 22, }}>
          メニュー
        </h2>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <li>
            <a href="/tenant/dashboard/notices">
              お知らせ一覧
            </a>
          </li>
          <li>
            <a href="/tenant/dashboard/inquiry">
              問い合わせ
              {hasOpenInquiry && (
                <span
                  style={{
                    color: 'red',
                    marginLeft: 6,
                  }}
                >
                  ●
                </span>
              )}
            </a>
          </li>
          <li>
            <a href="/tenant/dashboard/documents">
              契約・書類を見る
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
