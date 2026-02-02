import Link from 'next/link'
import { getNoticeStats } from '@/lib/management/getNoticeStats'

type Props = {
  propertyIds: string[]
  limit?: number
}

export default async function ManagementNoticeList({ propertyIds, limit }: Props) {
  const rows = await getNoticeStats(propertyIds)

  if (rows.length === 0) {
    return <p>お知らせはまだありません。</p>
  }

  const hasMore = limit ? rows.length > limit : false
  const visibleRows = limit ? rows.slice(0, limit) : rows
  const hiddenCount = limit ? rows.length - limit : 0

  return (
    <div style={{ marginTop: 16 }}>
      <h2>お知らせ管理</h2>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        }}
      >
        <thead>
          <tr>
            <th align="left">タイトル</th>
            <th align="center" style={{ width: 80 }}>
              既読
            </th>
            <th align="left" style={{ width: 120 }}>
              作成日
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((r) => (
            <tr key={r.id}>
              <td>
                <Link
                  href={`/management/dashboard/notices/${r.id}`}
                  style={{ textDecoration: 'none', color: '#0a0a0a' }}
                >
                  {r.title}
                </Link>
              </td>
              <td align="center">
                {r.read}/{r.total}
              </td>
              <td>{new Date(r.created_at).toLocaleDateString()}</td>
            </tr>
          ))}

          {hasMore && (
            <tr>
              <td style={{ color: '#999' }}>
                …（他 {hiddenCount} 件）
              </td>
              <td />
              <td />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
