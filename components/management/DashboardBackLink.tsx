'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardBackLink() {
  const pathname = usePathname()

  // ダッシュボードトップでは表示しない
  if (pathname === '/management/dashboard') {
    return null
  }

  return (
    <Link
      href="/management/dashboard"
      style={{
        marginRight: 12,
        textDecoration: 'none',
        fontSize: 14,
      }}
    >
      ← ダッシュボードへ
    </Link>
  )
}
