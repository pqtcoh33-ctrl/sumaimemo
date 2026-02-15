'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { logout } from '@/lib/auth/logout'

export default function ManagementHeaderClient({
  companyName,
}: {
  companyName: string
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [menuTop, setMenuTop] = useState(56)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuTop(rect.bottom)
    }
  }, [open])

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

      {/* PC表示 */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/management/dashboard/settings">
            <button>設定</button>
          </Link>

          <button onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      )}

      {/* モバイル表示 */}
      {isMobile && (
        <>
          <button
            ref={buttonRef}
            onClick={() => setOpen((v) => !v)}
            style={{
              fontSize: 22,
              background: 'none',
              border: 'none',
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
              <div
                style={{ position: 'absolute', inset: 0 }}
                onClick={() => setOpen(false)}
              />

              <div
                style={{
                  position: 'absolute',
                  top: menuTop,
                  right: 16,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: 12,
                  minWidth: 160,
                }}
              >
                <Link
                  href="/management/dashboard/settings"
                  onClick={() => setOpen(false)}
                  style={{ display: 'block', padding: 8 }}
                >
                  設定
                </Link>

                <button
                  onClick={() => {
                    setOpen(false)
                    handleLogout()
                  }}
                  style={{
                     display: 'block',
    padding: 8,
    width: '100%',
    textAlign: 'left',
    backgroundColor: '#ffffff',  // noneをやめる
    border: '1px solid transparent', // noneをやめる
    color: '#111827',
    WebkitAppearance: 'none',   // ← 重要
                  }}
                >
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </header>
  )
}
