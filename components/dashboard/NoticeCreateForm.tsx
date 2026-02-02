'use client'
import { useState, useTransition } from 'react'
import { createNotice } from '@/lib/management/noticeActions'

type Property = {
  id: string
  name: string
}

type Props = {
  properties: Property[]
}

export default function NoticeCreateForm({ properties }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!propertyId) {
      setError('物件を選択してください')
      return
    }
    if (!title.trim() || !body.trim()) {
      setError('タイトルと本文を入力してください')
      return
    }

    startTransition(async () => {
      try {
        await createNotice({ title, body, propertyId })
        setTitle('')
        setBody('')
        alert('お知らせを作成しました')
      } catch (err: any) {
        console.error(err)
        setError(err.message || '作成に失敗しました')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <label>
        物件
        <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="">選択してください</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        タイトル
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          required
        />
      </label>

      <label>
        本文
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="本文"
          rows={4}
          required
        />
      </label>

      <button type="submit" disabled={isPending}>
        {isPending ? '作成中...' : '作成'}
      </button>
    </form>
  )
}
