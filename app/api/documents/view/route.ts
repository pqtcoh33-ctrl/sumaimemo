//app/api/documents/view/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()

  // 認証チェック
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path')

  /**
   * -------------------------
   * ① path がある場合：書類表示用
   * -------------------------
   */
  if (path) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 60 * 5) // 5分

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.redirect(data.signedUrl)
  }

  /**
   * -------------------------
   * ② path がない場合：書類一覧取得
   * -------------------------
   */

  // テナントが所属する物件IDを取得
  // ※ テーブル名・カラム名は実装に合わせてください
  const { data: tenant, error: tenantError } = await supabase
    .from('profiles')
    .select('property_id')
    .eq('user_id', user.id)
    .single()

  if (tenantError || !tenant?.property_id) {
    return NextResponse.json({ documents: [] })
  }

  // 物件向け書類一覧取得
  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, title, file_path, created_at')
    .eq('property_id', tenant.property_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents })
}
