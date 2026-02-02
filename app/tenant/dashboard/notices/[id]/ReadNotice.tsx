'use client'

import { useEffect } from 'react'

export default function ReadNotice({
  noticeId,
}: {
  noticeId: string
}) {
  useEffect(() => {
    fetch('/api/tenant/notice/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notice_id: noticeId }),
    })
  }, [noticeId])

  return null
}
