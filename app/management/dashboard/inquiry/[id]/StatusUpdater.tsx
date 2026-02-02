// app/management/dashboard/inquiry/[id]/StatusUpdater.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'new' | 'in_progress' | 'closed'

const STATUS_LABEL: Record<Status, string> = {
  new: '未対応',
  in_progress: '保留',
  closed: '対応済み',
}

export default function StatusUpdater({
  inquiryId,
  initialStatus,
}: {
  inquiryId: string
  initialStatus: Status
}) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async () => {
    setLoading(true)

    const res = await fetch(
      `/api/management/inquiry/${inquiryId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    )

    setLoading(false)

    if (!res.ok) {
      alert('ステータス更新に失敗しました')
      return
    }

    // 再取得
    router.refresh()
  }

  return (
    <div style={{ marginTop: 16 }}>
      <label>
        <strong>ステータス：</strong>{' '}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          disabled={loading}
        >
          {Object.entries(STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={updateStatus}
        disabled={loading}
        style={{ marginLeft: 8 }}
      >
        更新
      </button>
    </div>
  )
}
