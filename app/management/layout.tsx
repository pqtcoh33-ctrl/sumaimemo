// app/management/layout.tsx
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth/getProfile'
import { ManagementProvider } from '@/components/management/ManagementProvider'
import ManagementHeader from '@/components/management/ManagementHeader'

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getProfile()

  if (!user) redirect('/login')
  if (!profile || profile.role !== 'management') redirect('/login')

  return (
    <ManagementProvider managementCompanyId={profile.management_company_id}>
      {/* 背景（グレー） */}
      <div className="min-h-screen bg-slate-100">
        <ManagementHeader />

        {/* メイン：グレーの上にカードを置く */}
        <main className="mx-auto max-w-7xl px-8 py-8 space-y-8">
          {children}
        </main>
      </div>
    </ManagementProvider>
  )
}

