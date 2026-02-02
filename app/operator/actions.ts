'use server'

import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ★必須
)

export async function createManagementAccount(
  email: string,
  password: string,
  managementCompanyId: string
) {
  // 1. Authユーザー作成
  const { data: userRes, error: userErr } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

  if (userErr) throw userErr

  const userId = userRes.user.id

  // 2. profiles 作成
  const { error: profileErr } = await adminSupabase
    .from('profiles')
    .insert({
      user_id: userId,
      role: 'management',
      management_company_id: managementCompanyId,
    })

  if (profileErr) throw profileErr

  // 3. 管理会社アカウント記録
  const { error: accErr } = await adminSupabase
    .from('management_company_accounts')
    .insert({
      management_company_id: managementCompanyId,
      login_email: email,
    })

  if (accErr) throw accErr
}
