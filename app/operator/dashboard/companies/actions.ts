'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdmin } from '@/lib/supabase/server'

interface Company {
  id: string
  name: string
  is_active: boolean
}

/* =========================
   管理会社作成
========================= */
export async function createManagementCompany(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) return

  const supabase = createSupabaseAdmin()

  // 1. auth.users 作成
  const { data, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'management' },
  })

  if (userError || !data?.user) {
    throw new Error('Auth ユーザー作成に失敗')
  }

  const userId = data.user.id

  // 2. profiles 作成
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: userId,
    role: 'management',
    management_company_id: null,
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    throw new Error('profiles 作成に失敗')
  }

  // 3. management_companies 作成
  const { data: company, error: companyError } = await supabase
    .from('management_companies')
    .insert({ name, is_active: true })
    .select('id')
    .single()

  if (companyError || !company) {
    await supabase.auth.admin.deleteUser(userId)
    await supabase.from('profiles').delete().eq('user_id', userId)
    throw new Error('管理会社作成に失敗')
  }

  // 4. profiles に companyId を紐付け
  await supabase
    .from('profiles')
    .update({ management_company_id: company.id })
    .eq('user_id', userId)

  revalidatePath('/operator/dashboard/companies')
}

/* =========================
   管理会社削除（auth含む完全削除）
========================= */
export async function deleteManagementCompany(companyId: string) {
  const supabase = createSupabaseAdmin()

  /* =========================
     1. properties 取得
  ========================= */
  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('management_company_id', companyId)

  const propertyIds = properties?.map(p => p.id) ?? []

  /* =========================
     2. tenant user_id 取得
  ========================= */
  const { data: tenants } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('role', 'tenant')
    .in('property_id', propertyIds)

  const tenantUserIds = tenants?.map(t => t.user_id) ?? []

  /* =========================
     3. inquiries 削除
  ========================= */
  if (propertyIds.length > 0) {
    await supabase
      .from('inquiries')
      .delete()
      .in('property_id', propertyIds)
  }

  /* =========================
     4. tenant_notice_reads 削除
  ========================= */
  if (tenantUserIds.length > 0) {
    await supabase
      .from('tenant_notice_reads')
      .delete()
      .in('tenant_user_id', tenantUserIds)
  }

  /* =========================
     5. documents（storage → table）
  ========================= */
  const { data: documents } = await supabase
    .from('documents')
    .select('file_path')
    .in('property_id', propertyIds)

  if (documents?.length) {
    const paths = documents.map(d => d.file_path).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from('documents').remove(paths)
    }
  }

  await supabase
    .from('documents')
    .delete()
    .in('property_id', propertyIds)

  /* =========================
     6. notices 削除
  ========================= */
  await supabase
    .from('notices')
    .delete()
    .eq('management_company_id', companyId)

  /* =========================
     7. tenant auth.users 削除
  ========================= */
  for (const userId of tenantUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) {
      console.error('tenant auth delete error:', userId, error)
    }
  }

  /* =========================
     8. tenant profiles 削除
  ========================= */
  await supabase
    .from('profiles')
    .delete()
    .eq('role', 'tenant')
    .in('property_id', propertyIds)

  /* =========================
     9. 管理会社ユーザー auth + profiles 削除
     （companyId に紐づくユーザーのみ確実に削除）
  ========================= */
  const { data: managementUsers } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('role', 'management')
    .eq('management_company_id', companyId)

  if (managementUsers) {
    for (const u of managementUsers) {
      const { error } = await supabase.auth.admin.deleteUser(u.user_id)
      if (error) console.error('management auth delete error:', u.user_id, error)
      await supabase.from('profiles').delete().eq('user_id', u.user_id)
    }
  }

  /* =========================
     10. properties 削除
  ========================= */
  await supabase
    .from('properties')
    .delete()
    .eq('management_company_id', companyId)

  /* =========================
     11. management_companies 削除
  ========================= */
  await supabase
    .from('management_companies')
    .delete()
    .eq('id', companyId)

  revalidatePath('/operator/dashboard/companies')
}

/* =========================
   管理会社一覧取得
========================= */
export async function getManagementCompanies(): Promise<Company[]> {
  const supabase = createSupabaseAdmin()

  const { data, error } = await supabase
    .from('management_companies')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
    return []
  }

  return data ?? []
}
