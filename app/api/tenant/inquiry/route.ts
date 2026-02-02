import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    const body = await req.json()

    const { category, body: inquiryBody } = body

    /* =========================
       バリデーション
       ========================= */
    if (!category || !inquiryBody) {
      return NextResponse.json(
        { success: false, message: 'カテゴリと内容は必須です' },
        { status: 400 }
      )
    }

    /* =========================
       ログインユーザー取得
       ========================= */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: '認証に失敗しました' },
        { status: 401 }
      )
    }

    /* =========================
       tenant profile 取得
       ★ unit_label を必ず取得する
       ========================= */
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('property_id, management_company_id, unit_label')
      .eq('user_id', user.id)
      .single()

    if (
      profileError ||
      !profile?.property_id ||
      !profile?.management_company_id ||
      !profile?.unit_label
    ) {
      return NextResponse.json(
        { success: false, message: '物件情報または部屋番号が取得できません' },
        { status: 400 }
      )
    }

    /* =========================
       inquiry 作成
       ★ inquiries.unit_label に保存
       ========================= */
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        tenant_id: user.id,
        property_id: profile.property_id,
        management_company_id: profile.management_company_id,
        unit_label: profile.unit_label, // ← ここが最重要
        category,
        body: inquiryBody,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      inquiry: data,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
