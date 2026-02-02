'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardBackLink from '@/components/management/DashboardBackLink'

type Document = {
  id: string
  title: string
  created_at: string
  signedUrl: string | null
  property_id: string
}

export default function DocumentsClient({
  documents,
}: {
  documents: Document[]
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!documents || documents.length === 0) {
    return (
      <div style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
        書類はまだありません。
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <DashboardBackLink />
      <h1 style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>
        書類一覧
      </h1>

      {/* ================= PC：テーブル ================= */}
      {!isMobile && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th align="left">タイトル</th>
              <th align="center" style={{ width: 140 }}>
                アップロード日
              </th>
              <th align="center" style={{ width: 100 }}>
                ファイル
              </th>
              <th align="center" style={{ width: 100 }}>
                操作
              </th>
            </tr>
          </thead>

          <tbody>
            {documents.map((doc) => (
              <tr
                key={doc.id}
                style={{ borderBottom: '1px solid #eee' }}
              >
                <td style={{ padding: '8px 4px' }}>{doc.title}</td>

                <td align="center">
                  {new Date(doc.created_at).toLocaleDateString()}
                </td>

                <td align="center">
                  {doc.signedUrl ? (
                    <a
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb' }}
                    >
                      確認
                    </a>
                  ) : (
                    '-'
                  )}
                </td>

                <td align="center">
                  <Link
                    href={`/management/dashboard/documents/${doc.id}?property=${doc.property_id}`}
                    style={{ color: '#2563eb' }}
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= スマホ：カード ================= */}
      {isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                background: '#fff',
              }}
            >
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {new Date(doc.created_at).toLocaleDateString()}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {doc.title}
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13,
                }}
              >
                {doc.signedUrl ? (
                  <a
                    href={doc.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb' }}
                  >
                    ファイル確認
                  </a>
                ) : (
                  <span style={{ color: '#9ca3af' }}>ファイルなし</span>
                )}

                <Link
                  href={`/management/dashboard/documents/${doc.id}?property=${doc.property_id}`}
                  style={{ color: '#2563eb' }}
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
