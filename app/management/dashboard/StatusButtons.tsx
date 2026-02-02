'use client'

import { useTransition } from 'react'
import { updateReportStatus } from './actions'

type Props = {
  reportId: string
  status: 'new' | 'in_progress' | 'resolved'
}

export function StatusButtons({ reportId, status }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {status === 'new' && (
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              updateReportStatus(reportId, 'in_progress')
            )
          }
        >
          対応中にする
        </button>
      )}

      {status !== 'resolved' && (
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              updateReportStatus(reportId, 'resolved')
            )
          }
        >
          完了にする
        </button>
      )}
    </div>
  )
}
