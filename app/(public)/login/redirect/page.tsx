import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function LoginRedirectPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // cookie は直接サーバーにセット済み
      },
    }
  )

  // cookie 経由で session を取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    // 未ログインなら login に戻す
    redirect('/login')
  }

  // profile を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // role に応じて振り分け
  if (profile.role === 'management') {
    redirect('/management/dashboard')
  } else if (profile.role === 'tenant') {
    redirect('/tenant/dashboard')
  } else {
    redirect('/login')
  }
}
