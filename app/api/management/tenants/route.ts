// app/api/management/tenants/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🔴 これが最後の一手
export const runtime = 'nodejs'

// 実行時にだけ admin client を作る
const adminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase admin env missing')
    return null
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// =========================
// 入居者一覧取得
// =========================
export async function GET(req: NextRequest) {
  const admin = adminClient()
  if (!admin) {
    return NextResponse.json([], { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('property_id')

  if (!propertyId) {
    return NextResponse.json([], { status: 400 })
  }

  const { data, error } = await admin
    .from('profiles')
    .select('user_id, unit_label, property_id, email') // ← ここだけ追加
    .eq('role', 'tenant')
    .eq('property_id', propertyId)
    .order('unit_label')

  if (error) {
    console.error('getTenantsByProperty error:', error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// =========================
// 入居者削除
// =========================
export async function DELETE(req: NextRequest) {
  const admin = adminClient()
  if (!admin) {
    return NextResponse.json({ success: false }, { status: 500 })
  }

  const { user_id } = await req.json()

  if (!user_id) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  await admin.from('inquiries').delete().eq('tenant_id', user_id)
  await admin
    .from('tenant_notice_reads')
    .delete()
    .eq('tenant_user_id', user_id)
  await admin.from('profiles').delete().eq('user_id', user_id)
  await admin.auth.admin.deleteUser(user_id)

  return NextResponse.json({ success: true })
}
