import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { handleLoginError } from '@/lib/auth/handleLoginError'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const supabase = createRouteHandlerClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Supabase management login error:', error.message)
    return NextResponse.json(
      { success: false, message: handleLoginError(error) },
      { status: 401 }
    )
  }

  return NextResponse.json({ success: true })
}
