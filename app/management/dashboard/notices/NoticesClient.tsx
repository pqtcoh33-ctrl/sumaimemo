'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardBackLink from '@/components/management/DashboardBackLink'

type NoticeStat = {
  id: string
  title: string
  created_at: string
  read?: number
  total?: number
}

type Props = {
  notices: NoticeStat[]
}

function shorten(text: string, max = 32) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '…' : text
}

export default function NoticesClient({ notices }: Props) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!notices || notices.length === 0) {
    return (
      <div style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
        お知らせはまだありません。
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <DashboardBackLink />
      <h1 style={{ marginBottom: 12, fontSize: 16, fontWeight: 700 }}>
        お知らせ一覧
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
              <th align="center" style={{ width: 120 }}>
                既読
              </th>
              <th align="center" style={{ width: 140 }}>
                作成日
              </th>
              <th align="center" style={{ width: 120 }}>
                操作
              </th>
            </tr>
          </thead>

          <tbody>
            {notices.map((n) => (
              <tr
                key={n.id}
                style={{ borderBottom: '1px solid #eee' }}
              >
                <td style={{ padding: '8px 4px' }}>
                  {shorten(n.title, 36)}
                </td>

                <td align="center">
                  {(n.read ?? 0)}/{(n.total ?? 0)}
                </td>

                <td align="center">
                  {new Date(n.created_at).toLocaleDateString()}
                </td>

                <td align="center">
                  <Link
                    href={`/management/dashboard/notices/${n.id}`}
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
          {notices.map((n) => (
            <div
              key={n.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                background: '#fff',
              }}
            >
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {new Date(n.created_at).toLocaleDateString()}
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {shorten(n.title, 40)}
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  既読 {(n.read ?? 0)}/{(n.total ?? 0)}
                </span>

                <Link
                  href={`/management/dashboard/notices/${n.id}`}
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
