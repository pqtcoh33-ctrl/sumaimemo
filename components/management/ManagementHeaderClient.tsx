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
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'relative',
      }}
    >
      {/* 左側：flexで残り幅を使う */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flex: 1,          // ★ 重要
          minWidth: 0,      // ★ 省略を効かせるため必須
        }}
      >
        <Link href="/management/dashboard">
          <img
            src="/logo.png"
            alt="アプリロゴ"
            style={{
              height: 32,
              width: 'auto',
              flexShrink: 0,
            }}
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
            flex: 1,          // ★ 残り幅のみ使う
            minWidth: 0,
          }}
        >
          {companyName}
        </span>
      </div>

      {/* PC用 */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Link href="/management/dashboard/settings">
            <button>設定</button>
          </Link>
          <form action={logout}>
            <button type="submit">ログアウト</button>
          </form>
        </div>
      )}

      {/* スマホ */}
      {isMobile && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              fontSize: 22,
              background: 'none',
              border: 'none',
              padding: 4,
              flexShrink: 0, // ★ 押し出されない
            }}
          >
            ☰
          </button>

          {open && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 16,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: 8,
                zIndex: 10,
                minWidth: 140,
              }}
            >
              <Link href="/management/dashboard/settings">
                <div style={{ padding: 8 }}>設定</div>
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  style={{
                    padding: 8,
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  ログアウト
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </header>
  )
}
