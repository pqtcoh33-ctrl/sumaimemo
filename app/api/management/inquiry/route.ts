import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type InquiryStatus = '未対応' | '保留' | '対応済み'

type InquiryRow = {
  id: string
  tenant_id: string
  property_id: string | null
  category: string | null
  body: string
  status: InquiryStatus
  created_at: string
  tenants: { unit_label: string | null }[] // JOIN した tenants テーブル
}

type Property = {
  id: string
  name: string
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') ?? undefined
    const date = url.searchParams.get('date') ?? undefined
    const property_id = url.searchParams.get('property_id') ?? undefined

    // =========================
    // Server-side Supabase（ログインユーザー確認用）
    // =========================
    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ inquiries: [], properties: [] }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('management_company_id, role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'management') {
      return NextResponse.json({ inquiries: [], properties: [] }, { status: 403 })
    }

    const management_company_id = profile.management_company_id

    // =========================
    // Admin client（集計専用）
    // =========================
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // =========================
    // 物件一覧取得
    // =========================
    const { data: properties, error: propError } = await admin
      .from('properties')
      .select('id, name')
      .eq('management_company_id', management_company_id)
      .order('name', { ascending: true })

    if (propError) throw propError

    // =========================
    // 問い合わせ一覧取得（tenant JOIN）
    // =========================
    let query = admin
      .from('inquiries')
      .select(`
        id,
        tenant_id,
        property_id,
        category,
        body,
        status,
        created_at,
        tenants!inner(unit_label)
      `)
      .eq('management_company_id', management_company_id)
      .order('created_at', { ascending: false })

    if (property_id) query = query.eq('property_id', property_id)
    if (status) query = query.eq('status', status)
    if (date) {
      query = query
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`)
    }

    const { data: inquiries, error } = await query
    if (error) throw error

    return NextResponse.json({
      inquiries: inquiries ?? [],
      properties: properties ?? [],
    })
  } catch (err: any) {
    console.error('Inquiry fetch error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
