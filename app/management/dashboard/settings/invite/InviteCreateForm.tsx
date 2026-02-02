'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { createTenantInvite } from './actions'

type Args = {
  propertyId: string
  unitLabel: string
}

type Props = {
  properties: { id: string; name: string }[]
  defaultProperty: string
  initialToken: string | null
}

export default function InviteCreateForm({ properties, defaultProperty, initialToken }: Props) {
  const [propertyId, setPropertyId] = useState('')
  const [unitLabel, setUnitLabel] = useState('')
  const [token, setToken] = useState(initialToken)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!propertyId) throw new Error('物件を選択してください')
      if (!unitLabel.trim()) throw new Error('部屋番号を入力してください')

      const newToken = await createTenantInvite({ propertyId, unitLabel })
      setToken(newToken)
    } catch (err: any) {
      setError(err.message ?? '招待作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          物件
          <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            <option value="">物件を選択してください</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          部屋番号
          <input
            placeholder="例：203 / 1A / 101"
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          招待リンクを作成
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {token && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <h2>招待URL</h2>
          <input
            readOnly
            value={`${appUrl}/invite/${token}`}
            style={{ width: '100%', padding: '4px 8px', fontSize: 14 }}
          />
          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            このURLを入居者に渡してください（別ブラウザで開く）。
          </p>

          <div style={{ marginTop: 12 }}>
            {/* QRコードのサイズ調整: size={150} */}
            <QRCode value={`${appUrl}/invite/${token}`} size={150} />
          </div>
        </div>
      )}
    </div>
  )
}
