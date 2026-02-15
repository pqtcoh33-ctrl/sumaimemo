'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { logout } from '@/lib/auth/logout'

export default function ManagementHeaderClient({
  companyName,
}: {
  companyName: string
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (e) {
      console.error('ログアウトエラー', e)
    }
  }

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative',
        zIndex: 50,
      }}
    >
      {/* ===== モバイル表示 ===== */}
      {isMobile && (
        <div style={{ padding: '12px 16px' }}>
          {/* 1段目：ロゴ＋会社名 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
            }}
          >
            <Link href="/management/dashboard">
              <img
                src="/logo.png"
                alt="アプリロゴ"
                style={{ height: 32 }}
              />
            </Link>

            <span
              title={companyName}
              style={{
                fontSize: 14,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              {companyName}
            </span>
          </div>

          {/* 2段目：右寄せボタン */}
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <Link href="/management/dashboard/settings">
              <button
                style={{
                  fontSize: 13,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  WebkitAppearance: 'none',
                }}
              >
                設定
              </button>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                fontSize: 13,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#374151',
                WebkitAppearance: 'none',
              }}
            >
              ログアウト
            </button>
          </div>
        </div>
      )}

      {/* ===== PC表示 ===== */}
      {!isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Link href="/management/dashboard">
              <img
                src="/logo.png"
                alt="アプリロゴ"
                style={{ height: 32 }}
              />
            </Link>

            <span
              title={companyName}
              style={{
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {companyName}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/management/dashboard/settings">
              <button>設定</button>
            </Link>

            <button onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
