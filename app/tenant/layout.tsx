import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth/getProfile'
import TenantHeader from '@/components/tenant/TenantHeader'

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getProfile()

  if (!user) redirect('/login')
  if (!profile || profile.role !== 'tenant') redirect('/login')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9', // slate-100
      }}
    >
      <TenantHeader />

      <main
        style={{
          padding: '12px',
        }}
      >
        {/* コンテンツをカード化 */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 12,
            padding: '16px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
