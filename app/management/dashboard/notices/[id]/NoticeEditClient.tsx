'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { updateNotice, deleteNotice } from '@/lib/management/noticeActions'
import DashboardBackLink from '@/components/management/DashboardBackLink'

type Props = {
  noticeId: string
  initialTitle: string
  initialBody: string
  propertyId: string | null
}

export default function NoticeEditClient(props: Props) {
  const { noticeId, initialTitle, initialBody } = props
  const router = useRouter()

  // ✅ ① 現在のURLから property を取得
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('property')

  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  /* =========================
     更新
     ========================= */
  const handleUpdate = () => {
    startTransition(async () => {
      await updateNotice({ id: noticeId, title, body })
      setMessage('更新が完了しました')
    })
  }

  /* =========================
     削除（ダッシュボードへ）
     ========================= */
  const handleDelete = () => {
    if (!confirm('削除しますか？')) return

    startTransition(async () => {
      await deleteNotice(noticeId)

      setMessage('削除が完了しました')

      // ✅ ② property を付けたまま戻る
      const dashboardUrl = propertyId
        ? `/management/dashboard?property=${propertyId}`
        : '/management/dashboard'

      setTimeout(() => {
       router.push(
  props.propertyId
    ? `/management/dashboard?property=${props.propertyId}`
    : '/management/dashboard')
      }, 0)
    })
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <DashboardBackLink />

      <h1>お知らせ編集</h1>

      {message && (
        <p
          style={{
            color: '#332e7d',
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          {message}
        </p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          value={body}
          rows={8}
          onChange={(e) => setBody(e.target.value)}
        />

        <button onClick={handleUpdate} disabled={isPending}>
          更新する
        </button>

        <button
          onClick={handleDelete}
          style={{ color: 'red' }}
          disabled={isPending}
        >
          削除する
        </button>
      </div>
    </div>
  )
}
