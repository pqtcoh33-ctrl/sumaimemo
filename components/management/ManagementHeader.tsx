// components/management/ManagementHeader.tsx
import { createSupabaseServer } from '@/lib/supabase/server'
import ManagementHeaderClient from './ManagementHeaderClient'

export default async function ManagementHeader() {
  const supabase = createSupabaseServer()

  const { data: profile } = await supabase
    .from('profiles')
    .select('management_company_id')
    .single()

  let companyName = '管理会社'

  if (profile?.management_company_id) {
    const { data: company } = await supabase
      .from('management_companies')
      .select('name')
      .eq('id', profile.management_company_id)
      .single()

    if (company?.name) {
      companyName = company.name
    }
  }

  return <ManagementHeaderClient companyName={companyName} />
}
