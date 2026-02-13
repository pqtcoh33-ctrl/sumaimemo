// app/api/management/inquiry/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 日本語 enum
const ALLOWED_STATUS = ['未対応', '保留', '対応済み'] as const
type InquiryStatus = (typeof ALLOWED_STATUS)[number]

// UUIDバリデーション
const isValidUUID = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )

const adminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

/* =========================
   GET: 問い合わせ詳細取得
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { message: 'invalid id' },
        { status: 400 }
      )
    }

    const admin = adminClient()

    // ① inquiry取得（tenant_idを必ず含める）
    const { data: inquiry, error: inquiryError } = await admin
      .from('inquiries')
      .select(`
        id,
        category,
        body,
        status,
        created_at,
        tenant_id,
        properties (
          id,
          name
        )
      `)
      .eq('id', params.id)
      .single()

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { message: 'Not found' },
        { status: 404 }
      )
    }

    // ② tenant(email)取得
    const { data: tenant, error: tenantError } = await admin
      .from('profiles')
      .select('user_id, unit_label, email')
      .eq('user_id', inquiry.tenant_id)
      .single()

    if (tenantError) {
      console.error('Tenant fetch error:', tenantError)
    }

    // ③ 結合して返却（既存構造を維持）
    const response = {
      id: inquiry.id,
      category: inquiry.category,
      body: inquiry.body,
      status: inquiry.status,
      created_at: inquiry.created_at,
      properties: inquiry.properties,
      profiles: tenant ?? null,
    }

    return NextResponse.json(response)

  } catch (err: any) {
    console.error('Inquiry detail fetch error:', err)
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    )
  }
}

/* =========================
   PATCH: ステータス更新
========================= */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { success: false, message: 'invalid id' },
        { status: 400 }
      )
    }

    const inquiryId = params.id
    const { status } = await req.json()

    if (!status || !ALLOWED_STATUS.includes(status)) {
      return NextResponse.json(
        { success: false, message: '不正なステータスです' },
        { status: 400 }
      )
    }

    const admin = adminClient()

    const { error } = await admin
      .from('inquiries')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Inquiry status update error:', err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
