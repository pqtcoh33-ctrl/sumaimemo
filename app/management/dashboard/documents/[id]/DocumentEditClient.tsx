'use client'

import { useState, useTransition } from 'react'
import { updateDocument, deleteDocument } from './documentActions'
import DashboardBackLink from '@/components/management/DashboardBackLink'

type Props = {
  documentId: string
  initialTitle: string
  filePath: string
  createdAt: string
}

export default function DocumentEditClient({
  documentId,
  initialTitle,
  filePath,
  createdAt,
}: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`

  const handleUpdate = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        await updateDocument(documentId, title,)
        setMessage('更新しました')
      } catch {
        setMessage('更新に失敗しました')
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('この書類を削除しますか？')) return

    setMessage(null)
    startTransition(async () => {
      try {
        await deleteDocument(documentId, filePath)
        setMessage('削除しました')
      } catch {
        setMessage('削除に失敗しました')
      }
    })
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <DashboardBackLink />
      <h1>書類編集</h1>

      <p style={{ color: '#666', fontSize: 12 }}>
        アップロード日：{new Date(createdAt).toLocaleDateString()}
      </p>

      <div style={{ marginTop: 16 }}>
        <label>タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%', marginTop: 4 }}
        />
      </div>

      <div style={{ marginTop: 24 }}>
        <label>ファイル内容</label>
        <div style={{ marginTop: 8 }}>
          {fileUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
            <img src={fileUrl} style={{ maxWidth: '100%' }} />
          ) : (
            <iframe
              src={fileUrl}
              style={{ width: '100%', height: 600 }}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button onClick={handleUpdate} disabled={isPending}>
          更新
        </button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          style={{ color: 'red' }}
        >
          削除
        </button>
      </div>

      {message && (
        <p style={{ marginTop: 16, color: 'green' }}>{message}</p>
      )}
    </div>
  )
}
