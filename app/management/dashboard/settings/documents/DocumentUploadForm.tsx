'use client'

import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

type Property = {
  id: string
  name: string
}

type Props = {
  properties: Property[]
  management_company_id: string // ★ サーバー側から渡す
}

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export default function DocumentUploadForm({
  properties,
  management_company_id,
}: {
  properties: Property[]
  management_company_id: string
}) {

  const [propertyId, setPropertyId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!propertyId || !title || !file) {
      setMessage('物件・タイトル・ファイルをすべて入力してください')
      return
    }

    // ✅ ファイルサイズチェック（20MB）
    if (file.size > MAX_FILE_SIZE) {
      setMessage('ファイルサイズは20MB以下にしてください')
      return
    }

    // ✅ ファイル形式チェック（PDF・画像のみ）
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage('アップロードできるのは PDF または画像ファイルのみです')
      return
    }

    setLoading(true)

    const filePath = `${propertyId}/${Date.now()}_${file.name}`

    // ① Storage upload
    const { error: uploadError } = await supabaseClient.storage
      .from('documents')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      setMessage('ファイルのアップロードに失敗しました')
      setLoading(false)
      return
    }

    // ② DB insert（managementCompanyId を追加）
    const { error: insertError } = await supabaseClient
      .from('documents')
      .insert({
        property_id: propertyId,
        title,
        file_path: filePath,
        is_public: true,
        management_company_id, // ★ 追加
      })

    if (insertError) {
      setMessage('書類情報の保存に失敗しました')
      setLoading(false)
      return
    }

    setMessage('アップロードが完了しました')
    setPropertyId('')
    setTitle('')
    setFile(null)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 物件選択 */}
      <div style={{ marginBottom: 16 }}>
        <label>物件</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          style={{ display: 'block', width: '50%', marginTop: 4 }}
        >
          <option value="">選択してください</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* タイトル */}
      <div style={{ marginBottom: 16 }}>
        <label>書類タイトル</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：ゴミ出しルール"
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </div>

      {/* ファイル */}
      <div style={{ marginBottom: 16 }}>
        <label>書類ファイル</label>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ display: 'block', marginTop: 4 }}
        />
        <p style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
          PDF、画像（jpg、png、webpなど）のみアップロード可能です（20MB以下）※ファイル名はアルファベット表記にしてください
        </p>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'アップロード中...' : 'アップロード'}
      </button>

      {message && (
        <p
          style={{
            marginTop: 12,
            color: message.includes('完了') ? 'green' : 'red',
          }}
        >
          {message}
        </p>
      )}
    </form>
  )
}
