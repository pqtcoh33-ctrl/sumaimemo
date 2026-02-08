'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardBackLink from '@/components/management/DashboardBackLink'

export type Inquiry = {
  id: string
  property_id: string | null
  status: string
  created_at: string
  category: string | null
  body: string
  unit_label: string | null
}

type Props = {
  inquiries: Inquiry[]
}

export default function InquiryClient({ inquiries }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)

  // ★ 物件IDを現在のURLから取得
  const propertyId = searchParams.get('property') ?? ''

  const currentStatus = searchParams.get('status') ?? ''
  const currentDate = searchParams.get('date') ?? ''

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    value ? params.set(key, value) : params.delete(key)
    router.push(`?${params.toString()}`)
  }

  if (!inquiries || inquiries.length === 0) {
    return <p>問い合わせはまだありません。</p>
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <DashboardBackLink />

      <h1 style={{ marginBottom: 12 }}>問い合わせ一覧</h1>

      {/* ===== 検索 ===== */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <select
          value={currentStatus}
          onChange={(e) => updateQuery('status', e.target.value)}
        >
          <option value="">すべてのステータス</option>
          <option value="未対応">未対応</option>
          <option value="保留">保留</option>
          <option value="対応済み">対応済み</option>
        </select>

        <input
          type="date"
          value={currentDate}
          onChange={(e) => updateQuery('date', e.target.value)}
        />
      </div>

      {/* ================= PC：テーブル ================= */}
      {!isMobile && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr>
              <th align="left">部屋</th>
              <th align="left">カテゴリー</th>
              <th align="left">本文</th>
              <th align="center">ステータス</th>
              <th align="center">作成日</th>
              <th align="center">操作</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((r) => (
              <tr key={r.id}>
                <td>{r.unit_label ?? '—'}</td>
                <td>{r.category ?? '—'}</td>
                <td>{r.body}</td>
                <td align="center">{r.status}</td>
                <td align="center">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td align="center">
                  <Link
                    href={`/management/dashboard/inquiry/${r.id}?property=${propertyId}`}
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
          {inquiries.map((r) => (
            <div
              key={r.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                background: '#fff',
              }}
            >
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {r.unit_label ?? '—'} /{' '}
                {new Date(r.created_at).toLocaleDateString()}
              </div>

              <div style={{ fontWeight: 600, marginTop: 4 }}>
                {r.category ?? '—'}
              </div>

              <div style={{ marginTop: 8 }}>{r.body}</div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>状態：{r.status}</span>
                <Link
                  href={`/management/dashboard/inquiry/${r.id}?property=${propertyId}`}
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
