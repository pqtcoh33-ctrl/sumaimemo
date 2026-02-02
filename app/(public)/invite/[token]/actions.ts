'use server'

import { createClient } from '@supabase/supabase-js'

export async function activateTenant(token: string, userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  token = token.trim()
  if (!token) throw new Error('token が渡されていません')
  if (!userId) throw new Error('userId が渡されていません')

  // 招待取得
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('tenant_invites')
    .select('id, property_id, unit_label')
    .eq('token', token)
    .is('used_at', null)
    .single()

  if (inviteError || !invite) {
    throw new Error('無効または使用済みの招待です')
  }

  // profiles を UPDATE（ここが重要）
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      role: 'tenant',
      property_id: invite.property_id,
      unit_label: invite.unit_label,
    })
    .eq('user_id', userId)

  if (profileError) {
    throw new Error(`profiles 更新失敗: ${profileError.message}`)
  }

  // 招待を使用済みに
  const { error: inviteUpdateError } = await supabaseAdmin
    .from('tenant_invites')
    .update({
      tenant_user_id: userId,
      used_at: new Date().toISOString(),
    })
    .eq('id', invite.id)

  if (inviteUpdateError) {
    throw new Error(inviteUpdateError.message)
  }

  return { ok: true }
}
