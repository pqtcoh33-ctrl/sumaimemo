'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase/client'

export default function TenantHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const isDashboardTop = pathname === '/tenant/dashboard'

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        marginBottom: 16,
        background: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          whiteSpace: 'nowrap', // ← 折り返し防止
        }}
      >
        {/* ロゴ */}
        <Link
          href="/tenant/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0, // ← 縮まない
          }}
        >
          <img
            src="/logo.png"
            alt="アプリロゴ"
            style={{
              height: 32,
              width: 'auto',
              maxWidth: 160,
              display: 'block',
            }}
          />
        </Link>

        {/* 右側アクション */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0, // ← 折り返されない
          }}
        >
          {!isDashboardTop && (
            <Link
              href="/tenant/dashboard"
              style={{
                fontSize: 14,
                color: '#374151',
                textDecoration: 'none',
              }}
            >
              ← ダッシュボード
            </Link>
          )}

          {isDashboardTop && (
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                border: '1px solid #d1d5db',
                borderRadius: 8,
                background: '#f3f4f6',
                cursor: 'pointer',
              }}
            >
              ログアウト
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
