// app/tenant/dashboard/inquiry/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import InquiryForm from './InquiryForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TenantInquiryPage() {
  const supabase = createSupabaseServer()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // カテゴリ定義（必須）
  const categories = [
    { value: '設備関連', label: '設備関連' },
    { value: '苦情・トラブル', label: '苦情・トラブル' },
    { value: '騒音', label: '騒音' },
    { value: '清掃', label: '清掃' },
    { value: '駐車・駐輪場', label: '駐車・駐輪場' },
    { value: '家賃関連', label: '家賃関連' },
    { value: '退去連絡', label: '退去連絡' },
    { value: 'その他', label: 'その他' },
  ]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">お問い合わせ</h1>

      <InquiryForm categories={categories} />
       <Link
    href="/tenant/dashboard/inquiry/history"
    style={{ fontSize: 16, color: '#0070f3' }}
  >
    過去の問い合わせを見る
  </Link>
    </div>
    
  )
}
