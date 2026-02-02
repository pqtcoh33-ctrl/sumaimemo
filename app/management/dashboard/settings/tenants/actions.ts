'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export type Property = {
  id: string
  name: string
}

export type Tenant = {
  user_id: string
  unit_label: string | null
  property_id: string
}

// 物件取得
export async function getProperties(managementCompanyId: string): Promise<Property[]> {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('id, name')
    .eq('management_company_id', managementCompanyId)
    .order('name')

  if (error) {
    console.error('getProperties error:', error)
    throw new Error('物件の取得に失敗しました')
  }

  return data ?? []
}

// 入居者取得
export async function getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('user_id, unit_label, property_id')
    .eq('role', 'tenant')
    .eq('property_id', propertyId)
    .order('unit_label')

  if (error) {
    console.error('getTenantsByProperty error:', error)
    throw new Error('入居者の取得に失敗しました')
  }

  return data ?? []
}

// 入居者削除
export async function deleteTenant(tenantUserId: string) {
  if (!tenantUserId) throw new Error('tenantUserId is required')

  console.log('DELETE TENANT START', tenantUserId)

  // 1. inquiries 削除（tenant_id）
  const { error: inquiriesError } = await supabaseAdmin
    .from('inquiries')
    .delete()
    .eq('tenant_id', tenantUserId)
  if (inquiriesError) console.error('inquiries delete error:', inquiriesError)

  // 2. tenant_notice_reads 削除（tenant_user_id）
  const { error: readsError } = await supabaseAdmin
    .from('tenant_notice_reads')
    .delete()
    .eq('tenant_user_id', tenantUserId)
  if (readsError) console.error('tenant_notice_reads delete error:', readsError)

  // 3. profiles 削除（user_id）
  const { error: profilesError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('user_id', tenantUserId)
  if (profilesError) console.error('profiles delete error:', profilesError)

  // 4. auth.users 削除（Supabase Auth）
  const authDeleteResult = await supabaseAdmin.auth.admin.deleteUser(tenantUserId)
  if (authDeleteResult.error) console.error('auth.users delete error:', authDeleteResult.error)

  console.log('DELETE TENANT COMPLETE', tenantUserId)
}
