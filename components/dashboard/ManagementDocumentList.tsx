import { createSupabaseServer } from '@/lib/supabase/server'

type Props = {
  propertyIds: string[]
  limit?: number
}

export default async function ManagementDocumentList({
  propertyIds,
  limit = 5,
}: Props) {
  if (propertyIds.length === 0) {
    return <p>物件が選択されていません</p>
  }

  const supabase = createSupabaseServer()

  const { data: documents } = await supabase
    .from('documents')
    .select('id, title, created_at')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (
    <div>
      <h2>書類管理</h2>

      {!documents || documents.length === 0 ? (
        <p>書類はまだありません。</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.id} style={{ marginBottom: 8 }}>
              <strong>{doc.title}</strong>
              <br />
              <span style={{ fontSize: 12, color: '#666' }}>
                {new Date(doc.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
