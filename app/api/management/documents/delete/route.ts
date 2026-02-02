import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'management') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, file_path } = await req.json()

  // ① DB 削除
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    )
  }

  // ② Storage 削除
  await supabase.storage.from('documents').remove([file_path])

  return NextResponse.json({ success: true })
}
