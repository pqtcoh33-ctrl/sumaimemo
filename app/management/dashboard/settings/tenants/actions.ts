'use server'

export type Property = {
  id: string
  name: string
}

export type Tenant = {
  user_id: string
  unit_label: string | null
  property_id: string
}

// 物件取得（API経由）
export async function getProperties(managementCompanyId: string): Promise<Property[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/management/properties?management_company_id=${managementCompanyId}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    console.error('getProperties fetch error', res.status)
    throw new Error('物件の取得に失敗しました')
  }

  return res.json()
}

// 入居者取得（API経由）
export async function getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/management/tenants?property_id=${propertyId}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    console.error('getTenantsByProperty fetch error', res.status)
    throw new Error('入居者の取得に失敗しました')
  }

  return res.json()
}

// 入居者削除（API経由）
export async function deleteTenant(tenantUserId: string) {
  if (!tenantUserId) throw new Error('tenantUserId is required')

  const res = await fetch('/api/management/tenants', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: tenantUserId }),
  })

  if (!res.ok) {
    throw new Error('入居者削除に失敗しました')
  }

  return res.json()
}
