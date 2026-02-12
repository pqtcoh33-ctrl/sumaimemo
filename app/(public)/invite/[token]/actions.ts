'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function registerTenant(formData: FormData, inviteData: { id: string, property_id: string, unit_label: string, management_company_id: string }) {
  const supabase = await createSupabaseServer()

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    throw new Error('入力内容が不足しています')
  }

  /* 1) ユーザー作成 */
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError || !signUpData.user) {
    throw new Error(signUpError?.message ?? '登録に失敗しました')
  }

  const userId = signUpData.user.id

  /* 2) profiles 作成 */
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: profileError } = await admin.from('profiles').upsert({
    user_id: userId,
    role: 'tenant',
    property_id: inviteData.property_id,
    unit_label: inviteData.unit_label,
    management_company_id: inviteData.management_company_id,
    email,
  })

  if (profileError) throw new Error(profileError.message)

  /* 3) 招待使用済みに */
  const { error: inviteError } = await admin.from('tenant_invites').update({
    tenant_user_id: userId,
    used_at: new Date().toISOString(),
  }).eq('id', inviteData.id)

  if (inviteError) throw new Error(inviteError.message)

  /* 4) ログイン */
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) throw new Error(signInError.message)

  return { ok: true }
}
