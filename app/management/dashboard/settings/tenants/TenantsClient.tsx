'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import DashboardBackLink from '@/components/management/DashboardBackLink'

export type Property = {
  id: string
  name: string
}

export type Tenant = {
  user_id: string
  unit_label: string | null
}

type Props = {
  properties: Property[]
}

export default function TenantsClient({ properties }: Props) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    properties[0]?.id ?? ''
  )
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedPropertyId) return

    setLoading(true)

    fetch(`/api/management/tenants?property_id=${selectedPropertyId}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => setTenants(data))
      .catch(() => toast.error('入居者の取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [selectedPropertyId])

  async function handleDelete(userId: string) {
    if (!confirm('この入居者を削除しますか？')) return

    try {
      const res = await fetch('/api/management/tenants', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!res.ok) throw new Error()

      setTenants(prev => prev.filter(t => t.user_id !== userId))
      toast.success('入居者を削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  if (properties.length === 0) {
    return <p>管理中の物件がありません</p>
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <DashboardBackLink />

      <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        入居者一覧
      </h2>

      <div style={{ marginBottom: 16 }}>
        <select
          value={selectedPropertyId}
          onChange={e => setSelectedPropertyId(e.target.value)}
          style={{ padding: 8, minWidth: 240 }}
        >
          {properties.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>読み込み中...</p>}

      {!loading && tenants.length === 0 && (
        <p style={{ color: '#666' }}>入居者がいません</p>
      )}

      {!loading && tenants.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={thStyle}>部屋番号</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.user_id}>
                <td style={tdStyle}>{t.unit_label ?? '未設定'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(t.user_id)}
                    style={deleteBtnStyle}
                  >
                    退去（削除）
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: 8,
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
}

const tdStyle: React.CSSProperties = {
  padding: 8,
  borderBottom: '1px solid #eee',
}

const deleteBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  color: '#c00',
  background: 'transparent',
  border: '1px solid #c00',
  borderRadius: 4,
  cursor: 'pointer',
}
