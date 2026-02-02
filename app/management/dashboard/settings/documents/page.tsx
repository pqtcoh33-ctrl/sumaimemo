import { getProfile } from '@/lib/auth/getProfile'
import { redirect } from 'next/navigation'
import { createSupabaseAdmin } from '@/lib/supabase/server'
import DocumentUploadForm from './DocumentUploadForm'
import DashboardBackLink from '@/components/management/DashboardBackLink'

type Property = {
  id: string
  name: string
}

export default async function DocumentsPage() {
  const { profile } = await getProfile()

  if (!profile || profile.role !== 'management') {
    redirect('/dashboard')
  }

  const supabase = createSupabaseAdmin()

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, name')
    .eq('management_company_id', profile.management_company_id)
    .order('name')

  if (error) {
    console.error(error)
    throw new Error('物件の取得に失敗しました')
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <DashboardBackLink />
      <h1>書類アップロード</h1>

      <DocumentUploadForm
properties={properties ?? []}
  management_company_id={profile.management_company_id}
/>

    </div>
  )
}
