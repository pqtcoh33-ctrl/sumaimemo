// app/management/dashboard/inquiry/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useManagement } from '@/components/management/ManagementProvider'
import DashboardBackLink from '@/components/management/DashboardBackLink'

type InquiryDetail = {
  id: string
  category: string
  body: string
  status: '未対応' | '保留' | '対応済み'
  created_at: string
  properties: {
    id: string
    name: string
  }
  profiles: {
    unit_label: string | null
  }
}

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { selectedPropertyId } = useManagement()

  // 初回 fetch
  useEffect(() => {
    if (!inquiry) {
      fetch(`/api/management/inquiry/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('問い合わせの取得に失敗しました')
          return res.json()
        })
        .then((data: InquiryDetail) => setInquiry(data))
        .catch((err) => alert(err.message))
    }
  }, [inquiry, params.id])

  const updateStatus = async (newStatus: InquiryDetail['status']) => {
    if (!inquiry) return
    setLoading(true)
    try {
      const res = await fetch(`/api/management/inquiry/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'ステータス更新に失敗しました')
      }

      setInquiry({ ...inquiry, status: newStatus })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!inquiry) return <div>読み込み中...</div>

  return (
    <div style={{ maxWidth: 800 }}>
      <DashboardBackLink />
      <h2>問い合わせ詳細</h2>

      <p>
        <strong>物件：</strong> {inquiry.properties.name}
        <br />
        <strong>部屋番号：</strong> {inquiry.profiles.unit_label ?? '-'}
      </p>

      <p>
        <strong>カテゴリ：</strong> {inquiry.category}
        <br />
        <strong>ステータス：</strong>{' '}
        <select
          value={inquiry.status}
          onChange={(e) =>
            updateStatus(e.target.value as InquiryDetail['status'])
          }
          disabled={loading}
        >
          <option value="未対応">未対応</option>
          <option value="保留">保留</option>
          <option value="対応済み">対応済み</option>
        </select>
        {loading && ' 更新中...'}
        <br />
        <strong>投稿日：</strong> {new Date(inquiry.created_at).toLocaleString()}
      </p>

      <hr />

      <h3>問い合わせ内容</h3>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          border: '1px solid #ccc',
          padding: 12,
        }}
      >
        {inquiry.body}
      </div>

      <hr />
    </div>
  )
}
