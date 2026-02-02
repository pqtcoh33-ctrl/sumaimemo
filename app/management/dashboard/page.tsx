//app/management/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { getProfile } from '@/lib/auth/getProfile'


import PropertySelector from '@/components/dashboard/PropertySelector'

// ▼ Dashboard Sections
import DashboardInquirySection from '@/components/dashboard/sections/DashboardInquirySection'
import DashboardNoticeSection from '@/components/dashboard/sections/DashboardNoticeSection'
import DashboardDocumentSection from '@/components/dashboard/sections/DashboardDocumentSection'

import Card from '@/components/common/Card'

export default async function ManagementDashboardPage({
  searchParams,
}: {
  searchParams: { property?: string }
}) {
  const { user, profile } = await getProfile()

  if (!user || !profile || profile.role !== 'management') {
    redirect('/login')
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: properties } = await admin
    .from('properties')
    .select('id, name')
    .eq('management_company_id', profile.management_company_id)

  const propertyList = properties ?? []

  // ✅ ★ここが追加ポイント
  if (!searchParams.property && propertyList.length > 0) {
    redirect(`?property=${propertyList[0].id}`)
  }

  const selectedPropertyId = searchParams.property ?? null

  const targetPropertyIds = selectedPropertyId
    ? [selectedPropertyId]
    : propertyList.map((p) => p.id)

  return (
   <>
  <h1 className="text-xl font-semibold">
    管理会社ダッシュボード
  </h1>

  <Card>
    <PropertySelector
      properties={propertyList}
      selectedPropertyId={selectedPropertyId}
    />
  </Card>

  <Card>
    <DashboardInquirySection
      propertyIds={targetPropertyIds}
      selectedPropertyId={selectedPropertyId}
    />
  </Card>

  <Card>
    <DashboardNoticeSection
      propertyIds={targetPropertyIds}
      selectedPropertyId={selectedPropertyId}
    />
  </Card>

  <Card>
    <DashboardDocumentSection
      propertyIds={targetPropertyIds}
      selectedPropertyId={selectedPropertyId}
    />
  </Card>
  </>
)
}