import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // JWT role を直接確認（RLSと同一基準）
  const role = user.user_metadata?.role

  if (role !== 'operator') {
    redirect('/login')
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Operator Dashboard</h1>
      {children}
    </div>
  )
}
