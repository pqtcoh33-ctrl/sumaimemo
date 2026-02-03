import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// 入居者一覧取得
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const propertyId = searchParams.get('property_id')

  if (!propertyId) {
    return NextResponse.json([], { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('user_id, unit_label, property_id')
    .eq('role', 'tenant')
    .eq('property_id', propertyId)
    .order('unit_label')

  if (error) {
    console.error('getTenantsByProperty error:', error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// 入居者削除
export async function DELETE(req: NextRequest) {
  const { user_id } = await req.json()

  if (!user_id) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  await supabaseAdmin.from('inquiries').delete().eq('tenant_id', user_id)
  await supabaseAdmin
    .from('tenant_notice_reads')
    .delete()
    .eq('tenant_user_id', user_id)
  await supabaseAdmin.from('profiles').delete().eq('user_id', user_id)
  await supabaseAdmin.auth.admin.deleteUser(user_id)

  return NextResponse.json({ success: true })
}
