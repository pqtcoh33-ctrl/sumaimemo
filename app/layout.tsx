// app/layout.tsx

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SumaiMemo',
  description: '住まいの管理をもっとシンプルに',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}
