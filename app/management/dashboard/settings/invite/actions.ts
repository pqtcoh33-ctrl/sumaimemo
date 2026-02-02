'use server'

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'

type Args = {
  propertyId: string
  unitLabel: string
}

export async function createTenantInvite({ propertyId, unitLabel }: Args) {
  /* =========================
     管理会社ガード
     ========================= */
  const { profile, user } = await getProfile()
  if (!user || !profile || profile.role !== 'management') {
    throw new Error('管理者権限がありません')
  }

  const createdBy = user.id // ここでログイン中管理者のUUIDを取得

  /* =========================
     Service Role Supabase
     ========================= */
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL が未設定です')
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY が未設定です')

  const supabaseAdmin = createClient(url, serviceKey)

  /* =========================
     トークン生成
     ========================= */
  const token = crypto.randomUUID().replace(/-/g, '')

  /* =========================
     tenant_invites に insert
     ========================= */
  const { error } = await supabaseAdmin.from('tenant_invites').insert({
    token,
    property_id: propertyId,
    unit_label: unitLabel,
    created_by: createdBy,
  })

  if (error) {
    console.error('[createTenantInvite] insert error', error)
    throw new Error(error.message)
  }

  return token
}
