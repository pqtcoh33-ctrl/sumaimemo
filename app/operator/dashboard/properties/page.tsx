import { getProperties } from './actions'
import PropertiesClient from './PropertiesClient'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export default async function PropertiesPage() {
  const properties = await getProperties()

  // 管理会社一覧も取得してフォームに渡す
  const supabase = createSupabaseAdmin()
  const { data: managementCompanies } = await supabase
    .from('management_companies')
    .select('id, name')
    .order('name', { ascending: true })

  return <PropertiesClient initialProperties={properties} managementCompanies={managementCompanies || []} />
}
