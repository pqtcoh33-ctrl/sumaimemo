// components/dashboard/StatusButtons.tsx
'use client'

import { useTransition } from 'react'
import { updateReportStatus } from '@/app/(management)/dashboard/actions'

type Props = {
  reportId: string
  currentStatus: 'pending' | 'completed'
}

export default function StatusButtons({ reportId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = (status: 'pending' | 'completed') => {
    startTransition(async () => {
      try {
        await updateReportStatus({ reportId, status })
      } catch (err) {
        console.error(err)
      }
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        disabled={isPending || currentStatus === 'pending'}
        onClick={() => handleClick('pending')}
      >
        保留
      </button>
      <button
        disabled={isPending || currentStatus === 'completed'}
        onClick={() => handleClick('completed')}
      >
        完了
      </button>
    </div>
  )
}
