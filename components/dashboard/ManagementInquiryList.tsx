import { createClient } from '@supabase/supabase-js'

type Inquiry = {
  id: string
  category: string
  body: string
  created_at: string
}

export default async function ManagementInquiryList({
  propertyIds,
  limit = 3,
}: {
  propertyIds: string[]
  limit?: number
}) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /* ========= データ取得（総数込み） ========= */
  const { data, count } = await admin
    .from('inquiries')
    .select('id, category, body, created_at', {
      count: 'exact',
    })
    .in('property_id', propertyIds)
    .eq('status', '未対応') // ★ これだけ
    .order('created_at', { ascending: false })
    .limit(limit)

  const rows: Inquiry[] = data ?? []
  const totalCount = count ?? 0
  const hiddenCount =
    totalCount > limit ? totalCount - limit : 0

  const truncate = (text: string, length = 60) =>
    text.replace(/\n/g, ' ').slice(0, length) +
    (text.length > length ? '…' : '')

  return (
    <>
      <h2 style={{ marginBottom: 2 }}>問い合わせ管理</h2>
<span style={{ display: 'block', fontSize: 12, color: '#230cf1' }}>
  ※未対応の問い合わせのみを表示
</span>

      {rows.length === 0 ? (
        <p>現在、未対応の問い合わせはありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {rows.map((inq) => (
            <li
              key={inq.id}
              style={{
                padding: '1px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <div style={{ fontWeight: 600 }}>
                [{inq.category}]
              </div>

              <div
                style={{
                  fontSize: 16,
                  color: '#555',
                  margin: '4px 0',
                }}
              >
                {truncate(inq.body)}
              </div>

              <div style={{ fontSize: 12, color: '#999' }}>
                {new Date(inq.created_at).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {hiddenCount > 0 && (
        <div style={{ color: '#999', fontSize: 13, marginTop: 8 }}>
          …（他 {hiddenCount} 件）
        </div>
      )}
    </>
  )
}
