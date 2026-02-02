'use client'
import { useEffect, useState } from 'react'

type Document = {
  id: string
  title: string
  file_path: string
  created_at: string
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/documents/view')
        if (!res.ok) throw new Error('Failed to fetch documents')

        const json = await res.json()
        setDocuments(json.documents ?? [])
      } catch (err) {
        console.error(err)
        setError('書類の取得に失敗しました。')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  if (loading) return <p className="text-sm text-gray-500">読み込み中...</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (documents.length === 0)
    return <p className="text-sm text-gray-500">公開中の書類はありません。</p>

  return (
    <ul className="space-y-3">
      {documents.map((doc) => (
        <li
          key={doc.id}
          className="
            rounded-xl border border-gray-200 bg-white
            p-4
            flex flex-col gap-3
            shadow-sm
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          {/* ===== 左側：情報 ===== */}
          <div className="min-w-0">
            <p className="font-semibold text-base sm:text-sm truncate">
              {doc.title}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {new Date(doc.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* ===== 右側：操作 ===== */}
          <button
            onClick={() => {
              window.open(
                `/api/documents/view?path=${encodeURIComponent(
                  doc.file_path
                )}`,
                '_blank',
                'noopener,noreferrer'
              )
            }}
            className="
              w-full sm:w-auto
              rounded-lg
              bg-blue-600 px-4 py-2
              text-sm font-medium text-white
              text-center
              hover:bg-blue-700
              active:bg-blue-800
            "
          >
            書類を確認
          </button>
        </li>
      ))}
    </ul>
  )
}
