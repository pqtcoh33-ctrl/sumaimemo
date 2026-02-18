'use client'

import { useState, useRef } from 'react'
import QRCode from 'react-qr-code'
import { createTenantInvite } from './actions'

type Props = {
  properties: { id: string; name: string }[]
  defaultProperty: string
  initialToken: string | null
}

type BulkToken = { unitLabel: string; token: string }

export default function InviteCreateForm({ properties, defaultProperty, initialToken }: Props) {
  const [propertyId, setPropertyId] = useState(defaultProperty || '')
  const [unitLabel, setUnitLabel] = useState('')
  const [bulkInput, setBulkInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [token, setToken] = useState(initialToken)
  const [bulkTokens, setBulkTokens] = useState<BulkToken[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const qrRefs = useRef<Record<string, SVGSVGElement | null>>({})

  /** 単発生成 */
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!propertyId) throw new Error('物件を選択してください')
      if (!unitLabel.trim()) throw new Error('部屋番号を入力してください')
      const newToken = await createTenantInvite({ propertyId, unitLabel })
      setToken(newToken)
      setBulkTokens([])
      setTags([])
    } catch (err: any) {
      setError(err.message ?? '招待作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  /** 任意複数生成 */
  const handleBulkSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (!propertyId) throw new Error('物件を選択してください')
      if (!tags.length) throw new Error('部屋番号を入力してください')
      const tokens = await Promise.all(
        tags.map((label) => createTenantInvite({ propertyId, unitLabel: label }))
      )
      setBulkTokens(tags.map((label, i) => ({ unitLabel: label, token: tokens[i] })))
      setToken(null)
    } catch (err: any) {
      setError(err.message ?? '一括招待作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  /** タグ入力処理 */
  const handleBulkInputKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const values = bulkInput.split(/,|\n/).map((v) => v.trim()).filter(Boolean)
      const newTags = values.filter((v) => !tags.includes(v))
      setTags([...tags, ...newTags])
      setBulkInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  /** 印刷ページへ */
  const handlePrintPage = () => {
    if (!bulkTokens.length) return

    const query = encodeURIComponent(JSON.stringify(bulkTokens))
    window.open(`/management/dashboard/settings/invite/print?data=${query}`, '_blank')
  }

  /** QRコード画像保存（維持） */
  const handleDownloadQR = (unitLabel: string) => {
    const svgEl = qrRefs.current[unitLabel]
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngFile
      link.download = `${unitLabel}_qr.png`
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* ===== ここから下はUI一切変更なし ===== */}

      <div>
        <label style={{ fontWeight: 500 }}>
          物件を選択
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            style={{ width: '250px', padding: 6, marginTop: 4 }}
          >
            <option value="">物件を選択してください</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* 単独招待 */}
      <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>単独で作成する</h2>
        <form onSubmit={handleSingleSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            部屋番号
            <input
            placeholder="例：203 / 1A / 101"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
              style={{ width: '250px', padding: 6 }}
            />
          </label>
          <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
            招待リンクを生成
          </button>
        </form>

        {token && (
          <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
            <input readOnly value={`${appUrl}/invite/${token}`} style={{ width: '100%', padding: 4 }} />
            <div style={{ marginTop: 12 }}>
              <div ref={(el) => {
                if (el) qrRefs.current[unitLabel] = el.querySelector('svg')
              }}>
                <QRCode value={`${appUrl}/invite/${token}`} size={100} />
              </div>
              <button onClick={() => handleDownloadQR(unitLabel)} style={{ marginTop: 8 }}>
                QR保存
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 一括招待 */}
      <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>複数一括で作成する</h2>

        <textarea
        placeholder="部屋番号を改行またはカンマで複数入力"
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          onKeyDown={handleBulkInputKey}
          style={{ width: '100%', minHeight: 25, padding: 6, marginBottom: 12 }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {tags.map((t) => (
            <div key={t} style={{ background: '#eee', padding: '4px 8px', borderRadius: 4 }}>
              {t}
              <button onClick={() => removeTag(t)}>×</button>
            </div>
          ))}
        </div>

        <button onClick={handleBulkSubmit} disabled={loading} style={{ padding: '8px 12px' }}>
          一括生成
        </button>

        {bulkTokens.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>生成結果</h3>

            <div style={{ display: 'grid', gap: 16 }}>
              {bulkTokens.map(({ unitLabel, token }) => (
                <div key={unitLabel} style={{ padding: 8, border: '1px solid #eee', borderRadius: 6 }}>
                  <strong>{unitLabel}</strong>
                  <p style={{ fontSize: 12 }}>{`${appUrl}/invite/${token}`}</p>
                  <div ref={(el) => {
                    if (el) qrRefs.current[unitLabel] = el.querySelector('svg')
                  }}>
                    <QRCode value={`${appUrl}/invite/${token}`} size={100} />
                  </div>
                  <button onClick={() => handleDownloadQR(unitLabel)} style={{ marginTop: 8 }}>
                    QR保存
                  </button>
                </div>
              ))}
            </div>

            {/* ✅ ここだけ変更：PDF削除 → 印刷ページへ */}
            <button onClick={handlePrintPage} style={{ marginTop: 12, padding: '8px 12px' }}>
              印刷ページへ
            </button>
          </div>
        )}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
