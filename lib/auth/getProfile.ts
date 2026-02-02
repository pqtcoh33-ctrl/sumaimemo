// lib/auth/getProfile.ts
import { createSupabaseServer } from '@/lib/supabase/server'

export async function getProfile() {
  const supabase = createSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('[getProfile] profile error:', error)
    return { user, profile: null }
  }

  return { user, profile }
}
