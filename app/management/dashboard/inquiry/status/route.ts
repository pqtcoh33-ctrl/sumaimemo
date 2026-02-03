// app/api/management/inquiries/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    const { inquiry_id, status } = await req.json()

    if (!inquiry_id || !status) {
      return NextResponse.json(
        { success: false, message: 'パラメータ不足です' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', inquiry_id)

    if (error) {
      console.error('Update inquiry status error:', error.message)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Inquiry status API error:', err)
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
