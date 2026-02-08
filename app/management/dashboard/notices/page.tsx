import { getNoticeStats } from '@/lib/management/getNoticeStats'
import NoticesClient from './NoticesClient'
export const dynamic = 'force-dynamic'

type Props = {
  searchParams: {
    property?: string
  }
}

export default async function NoticesPage({ searchParams }: Props) {
  const propertyId = searchParams.property

  if (!propertyId) {
    return (
      <div className="p-4 text-sm text-gray-500">
        表示する物件を選択してください。
      </div>
    )
  }

  // ★ ダッシュボードと同じ
  const rows = await getNoticeStats([propertyId])

  return (
  <NoticesClient
    notices={rows}
    propertyId={propertyId}
  />
)

}
