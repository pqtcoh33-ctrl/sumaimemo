// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { handleLoginError } from '@/lib/auth/handleLoginError'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const supabase = createRouteHandlerClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json(
      { success: false, message: handleLoginError(error) },
      { status: 401 }
    )
  }

  // ★ cookie は Supabase が自動でセットされる
  return NextResponse.json({ success: true })
}

