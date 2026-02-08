'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export default function DashboardBackLink() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('property')

  // ダッシュボードトップでは表示しない
  if (pathname === '/management/dashboard') {
    return null
  }

  const href = propertyId
    ? `/management/dashboard?property=${propertyId}`
    : '/management/dashboard'

  return (
    <Link
      href={href}
      style={{
        marginRight: 12,
        textDecoration: 'none',
        fontSize: 14,
      }}
    >
      ← ダッシュボードへ戻る
    </Link>
  )
}
