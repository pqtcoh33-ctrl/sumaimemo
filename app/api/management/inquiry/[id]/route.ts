// app/api/management/inquiry/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 日本語 enum
const ALLOWED_STATUS = ['未対応', '保留', '対応済み'] as const
type InquiryStatus = (typeof ALLOWED_STATUS)[number]

// 🔴 追加：UUIDバリデーション（最小）
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
    // 🔴 追加：UUIDガード（ここだけ）
    if (!isValidUUID(params.id)) {
      return NextResponse.json(
        { message: 'invalid id' },
        { status: 400 }
      )
    }

    const admin = adminClient()

    const { data, error } = await admin
      .from('inquiries')
      .select(`
        id,
        category,
        body,
        status,
        created_at,
        properties (
          id,
          name
        ),
        profiles (
          unit_label
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { message: 'Not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data)
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
    // 🔴 追加：UUIDガード（GETと同じ）
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
