'use server'

import { createSupabaseAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/* =========================
   型
========================= */
export interface Property {
  id: string
  name: string
  management_company_id: string
  created_at: string
  updated_at: string
}

/* =========================
   物件一覧取得（← エラー原因だった関数）
========================= */
export async function getProperties(): Promise<Property[]> {
  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('properties')
    .select('id, name, management_company_id, created_at, updated_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('物件一覧取得エラー', error)
    return []
  }

  return data ?? []
}

/* =========================
   管理会社一覧取得
========================= */
export async function getManagementCompanies() {
  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('management_companies')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('管理会社一覧取得エラー', error)
    return []
  }

  return data ?? []
}

/* =========================
   物件作成
========================= */
export async function createProperty(formData: FormData) {
  const name = formData.get('name') as string
  const managementCompanyId = formData.get('managementCompanyId') as string

  if (!name || !managementCompanyId) {
    throw new Error('物件名と管理会社は必須です')
  }

  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('properties')
    .insert({
      name,
      management_company_id: managementCompanyId,
    })
    .select()
    .single()

  if (error) {
    console.error('物件登録エラー', error)
    throw new Error('物件登録に失敗しました')
  }

  revalidatePath('/operator/dashboard/properties')
  return data
}

/* =========================
   物件削除（auth 含む完全版）
========================= */
export async function deleteProperty(propertyId: string) {
  const supabase = createSupabaseAdmin()

  /* 1. tenant user_id 取得 */
  const { data: tenants, error: tenantsError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('property_id', propertyId)
    .eq('role', 'tenant')

  if (tenantsError) throw tenantsError

  const tenantUserIds = tenants?.map(t => t.user_id) ?? []

  /* 2. inquiries */
  await supabase
    .from('inquiries')
    .delete()
    .eq('property_id', propertyId)

  /* 3. tenant_notice_reads */
  if (tenantUserIds.length > 0) {
    await supabase
      .from('tenant_notice_reads')
      .delete()
      .in('tenant_user_id', tenantUserIds)
  }

  /* 4. documents（storage → table） */
  const { data: documents } = await supabase
    .from('documents')
    .select('file_path')
    .eq('property_id', propertyId)

  if (documents?.length) {
    const paths = documents.map(d => d.file_path).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from('documents').remove(paths)
    }
  }

  await supabase
    .from('documents')
    .delete()
    .eq('property_id', propertyId)

  /* 5. notices */
  await supabase
    .from('notices')
    .delete()
    .eq('property_id', propertyId)

  /* 6. auth.users 削除 */
  for (const userId of tenantUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) {
      console.error('auth delete error:', userId, error)
    }
  }

  /* 7. profiles */
  await supabase
    .from('profiles')
    .delete()
    .eq('property_id', propertyId)
    .eq('role', 'tenant')

  /* 8. properties */
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)

  if (error) {
    console.error('物件削除エラー', error)
    throw new Error('物件削除に失敗しました')
  }

  revalidatePath('/operator/dashboard/properties')
}
