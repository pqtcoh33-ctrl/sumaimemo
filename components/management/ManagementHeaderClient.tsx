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

  // モバイル判定
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // メニュー自動クローズ（スクロール・タップ・リサイズ）
  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)

    window.addEventListener('scroll', close)
    window.addEventListener('resize', close)
    

    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
     
    }
  }, [open])

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
        zIndex: 50,
      }}
    >
      {/* 左側 */}
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
            flex: 1,
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

      {/* スマホ用 */}
      {isMobile && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              fontSize: 22,
              background: 'none',
              border: 'none',
              padding: 4,
              flexShrink: 0,
            }}
          >
            ☰
          </button>

          {open && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
              }}
            >
              {/* 背景クリックで閉じる */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                }}
                onClick={() => setOpen(false)}
              />

              {/* メニュー本体 */}
              <div
                style={{
                  position: 'absolute',
                  top: 56,
                  right: 16,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: 12,
                  minWidth: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <Link
                  href="/management/dashboard/settings"
                  onClick={() => setOpen(false)}
                  style={{ padding: 8 }}
                >
                  設定
                </Link>

                <form
                  action={logout}
                  onSubmit={() => setOpen(false)}
                >
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
            </div>
          )}
        </>
      )}
    </header>
  )
}
