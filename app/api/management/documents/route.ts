import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServer()

  // 認証チェック（role 判定はしない）
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const property_id = searchParams.get('property_id')

  let query = supabase
    .from('documents')
    .select(`
      id,
      title,
      type,
      property_id,
      file_path,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  if (property_id) {
    query = query.eq('property_id', property_id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ documents: data })
}
