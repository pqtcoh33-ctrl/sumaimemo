// app/(public)/layout.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 12,
          padding: '32px 28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        {/* ロゴ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Link href="/login">
            <div
              style={{
                position: 'relative',
                width: 180,
                height: 48,
              }}
            >
              <Image
                src="/furontlogo.png"
                alt="SumaiMemo"
                fill
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>
          </Link>
        </div>

        {children}
      </div>
    </main>
  )
}
