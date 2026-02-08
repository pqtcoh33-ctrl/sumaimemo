import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Inquiry = {
  id: string
  category: string
  body: string
  created_at: string
}

export default async function InquiryHistoryPage() {
  const { user, profile } = await getProfile()

  if (!user || !profile || profile.role !== 'tenant') {
    redirect('/login')
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await admin
    .from('inquiries')
    .select('id, category, body, created_at')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  const inquiries: Inquiry[] = data ?? []

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>問い合わせ履歴</h1>

        {inquiries.length === 0 ? (
        <p>これまでに送信した問い合わせはありません。</p>
      ) : (
        inquiries.map((q) => (
          <article
            key={q.id}
            style={{
              borderBottom: '1px solid #eee',
              paddingBottom: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              種別：{q.category}
            </div>

            <p style={{ color: '#555', margin: '8px 0' }}>
              {q.body}
            </p>

            <div style={{ fontSize: 12, color: '#999' }}>
              {new Date(q.created_at).toLocaleDateString()}
            </div>
          </article>
        ))
      )}
    </div>
  )
}
