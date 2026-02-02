'use server'

import { createSupabaseServer } from '@/lib/supabase/server'

export async function updateStatus(
  reportId: string,
  status: 'new' | 'in_progress' | 'resolved'
) {
  const supabase = createSupabaseServer()

  const { error } = await supabase.rpc('update_check_report_status', {
    p_report_id: reportId,
    p_status: status,
  })

  if (error) {
    console.error(error)
    throw new Error('ステータス更新に失敗しました')
  }
}
