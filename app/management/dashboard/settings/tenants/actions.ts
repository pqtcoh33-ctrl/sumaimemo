// app/management/dashboard/settings/tenants/actions.ts
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export type Property = { id: string; name: string }
export type Tenant = { user_id: string; unit_label: string | null }

export async function getProperties(managementCompanyId: string): Promise<Property[]> {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('id, name')
    .eq('management_company_id', managementCompanyId)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('user_id, unit_label, property_id')
    .eq('role', 'tenant')
    .eq('property_id', propertyId)
    .order('unit_label')
  if (error) throw error
  return data ?? []
}

export async function deleteTenant(tenantUserId: string) {
  if (!tenantUserId) throw new Error('tenantUserId is required')
  await supabaseAdmin.from('inquiries').delete().eq('tenant_id', tenantUserId)
  await supabaseAdmin.from('tenant_notice_reads').delete().eq('tenant_user_id', tenantUserId)
  await supabaseAdmin.from('profiles').delete().eq('user_id', tenantUserId)
  await supabaseAdmin.auth.admin.deleteUser(tenantUserId)
}
