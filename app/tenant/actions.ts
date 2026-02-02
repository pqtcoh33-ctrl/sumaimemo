'use server'

import { createClient } from '@supabase/supabase-js'

export async function activateTenant(
  token: string,
  password: string
) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. 招待の検証（未使用のみ）
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('tenant_invites')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .single()

  if (inviteError || !invite) {
    throw new Error('招待リンクが無効です')
  }

  // 2. Auth user 作成
  const { data: userResult, error: userError } =
    await supabaseAdmin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true,
    })

  if (userError || !userResult.user) {
    throw new Error(userError?.message ?? 'ユーザー作成に失敗しました')
  }

  const userId = userResult.user.id

  // 3. profiles を tenant に更新
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ role: 'tenant' })
    .eq('user_id', userId)

  if (profileError) {
    throw new Error(profileError.message)
  }

  // 4. tenancy を作成（★最重要）
  const { error: tenancyError } = await supabaseAdmin
    .from('tenancies')
    .insert({
      tenant_user_id: userId,
      property_id: invite.property_id,
      unit_label: invite.unit_label,
      status: 'active',
    })

  if (tenancyError) {
    throw new Error(tenancyError.message)
  }

  // 5. 招待を使用済みに（最後）
  const { error: consumeError } = await supabaseAdmin
    .from('tenant_invites')
    .update({
      used_at: new Date().toISOString(),
    })
    .eq('id', invite.id)

  if (consumeError) {
    throw new Error(consumeError.message)
  }

  return { ok: true }
}
