// app/tenant/dashboard/inquiry/InquiryForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  value: string
  label: string
}

type Props = {
  categories: Category[]
}

export default function InquiryForm({ categories }: Props) {
  const router = useRouter()

  const [category, setCategory] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !body.trim()) {
      alert('カテゴリと内容は必須です')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/tenant/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          body,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || '送信に失敗しました')
      }

      alert('お問い合わせを送信しました')
      router.push('/tenant/dashboard/inquiry')
      router.refresh()
    } catch (err: any) {
      alert(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium mb-1">
          カテゴリ<span className="text-red-500 ml-1">*</span>
        </label>
        <select
          className="w-full border rounded px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">選択してください</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* 本文 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          内容<span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[120px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>

      {/* 送信 */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? '送信中...' : '送信する'}
        </button>
      </div>
    </form>
  )
}
