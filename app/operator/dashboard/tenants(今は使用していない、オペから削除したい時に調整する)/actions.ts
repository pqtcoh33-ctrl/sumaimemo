'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteTenant(userId: string) {
  const supabase = createSupabaseServer()

  // profiles から削除
  await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'tenant')

  // auth.users 側も削除（重要）
  await supabase.auth.admin.deleteUser(userId)

  revalidatePath('/operator/dashboard/tenants')
}
