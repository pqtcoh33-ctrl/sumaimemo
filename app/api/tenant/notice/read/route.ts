import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'

export async function POST(req: Request) {
  /* =========================
     認証チェック
     ========================= */
  const { user, profile } = await getProfile()

  if (!user || !profile || profile.role !== 'tenant') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  /* =========================
     リクエスト取得
     ========================= */
  const { notice_id } = await req.json()

  if (!notice_id) {
    return NextResponse.json({ error: 'notice_id is required' }, { status: 400 })
  }

  /* =========================
     Service Role Supabase
     ========================= */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  /* =========================
     既読登録
     ========================= */
  const { error } = await admin
    .from('tenant_notice_reads')
    .insert({
      notice_id,
      tenant_user_id: user.id,
      read_at: new Date().toISOString(),
    })

  // UNIQUE 制約違反は無視（既に既読）
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
