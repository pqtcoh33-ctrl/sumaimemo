// app/management/dashboard/inquiry/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useManagement } from '@/components/management/ManagementProvider'
import DashboardBackLink from '@/components/management/DashboardBackLink'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
    user_id: string
    unit_label: string | null
    email: string | null
  }| null
}

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(false)

  const [tenantEmail, setTenantEmail] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState(false)

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

  // ★ メール取得
  const fetchTenantEmail = () => {
  if (!inquiry?.profiles?.email) {
    alert('メール取得に失敗しました')
    return
  }

  setTenantEmail(inquiry.profiles.email)
  setShowModal(true)
}


  if (!inquiry) return <div>読み込み中...</div>

  return (
    <div style={{ maxWidth: 800 }}>
      <DashboardBackLink />
      <h2>問い合わせ詳細</h2>

      <p>
        <strong>物件：</strong> {inquiry.properties.name}
        <br />
        <strong>部屋番号：</strong> {inquiry.profiles?.unit_label ?? '-'}
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

      {/* ★ 入居者へ連絡ボタン */}
      <button
        onClick={fetchTenantEmail}
        style={{
          marginTop: 16,
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        入居者へ連絡する
      </button>

      {/* モーダル */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 8,
              width: 320,
            }}
          >
            <h3>入居者メールアドレス</h3>

            <div
              style={{
                border: '1px solid #ccc',
                padding: 8,
                borderRadius: 4,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 14, wordBreak: 'break-all' }}>
                {tenantEmail}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tenantEmail || '')
                  setToast(true)
                  setTimeout(() => setToast(false), 2000)
                }}
                style={{
                  marginLeft: 8,
                  fontSize: 12,
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                コピー
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 16,
                width: '100%',
                padding: 8,
                backgroundColor: '#eee',
                border: 'none',
                borderRadius: 6,
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* トースト */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: '#333',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          ✓ コピーしました
        </div>
      )}
    </div>
  )
}
