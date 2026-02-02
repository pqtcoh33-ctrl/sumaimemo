'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useManagement } from '@/components/management/ManagementProvider'

type InquiryStatus = '未対応' | '保留' | '対応済み'

type Inquiry = {
  id: string
  category: string
  body: string
  status: InquiryStatus
  created_at: string
  property_id: string
  profiles: {
    unit_label: string | null
  } | null
}

type Property = {
  id: string
  name: string
}

export default function InquiryList({
  inquiries,
  properties,
  initialFilters,
}: {
  inquiries: Inquiry[]
  properties: Property[]
  initialFilters: { status: string; date: string }
}) {
  const router = useRouter()
  const { selectedPropertyId } = useManagement()
  const [filters, setFilters] = useState(initialFilters)

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.date) params.set('date', filters.date)
    // 物件IDは Provider から取得して URL にセット
    if (selectedPropertyId) params.set('property_id', selectedPropertyId)

    router.push(`/management/dashboard/inquiry?${params.toString()}`)
  }

  const currentProperty = properties.find(
    (p) => p.id === selectedPropertyId
  )

  return (
    <div>
      <h2>
        問い合わせ一覧
        {currentProperty ? ` - ${currentProperty.name}` : ''}
      </h2>

      <div style={{ marginBottom: 16 }}>
        {/* ステータスフィルタ */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">すべてのステータス</option>
          <option value="未対応">未対応</option>
          <option value="保留">保留</option>
          <option value="対応済み">対応済み</option>
        </select>

        {/* 日付フィルタ */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) =>
            setFilters({ ...filters, date: e.target.value })
          }
        />

        {/* 検索ボタン */}
        <button onClick={applyFilters}>検索</button>
      </div>

      <table width="100%" border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>日付</th>
            <th>部屋</th>
            <th>カテゴリー</th>
            <th>本文</th>
            <th>ステータス</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                問い合わせはありません
              </td>
            </tr>
          )}

          {inquiries.map((inq) => (
            <tr key={inq.id}>
              <td>
                {new Date(inq.created_at).toLocaleDateString()}
              </td>
              <td>{inq.profiles?.unit_label ?? '-'}</td>
              <td>{inq.category}</td>
              <td>
                <a
                  href={`/management/dashboard/inquiry/${inq.id}`}
                  style={{ textDecoration: 'underline' }}
                >
                  {inq.body.length > 40
                    ? `${inq.body.slice(0, 40)}…`
                    : inq.body}
                </a>
              </td>
              <td>{inq.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
